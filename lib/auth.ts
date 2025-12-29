// lib/auth.ts
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { UserRole, BusinessStatus } from "@prisma/client";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

// ==================== EXISTING FUNCTIONS ====================

// Get current user from Clerk + Database
export async function getCurrentUser() {
  // auth() is now async in Next.js 16 / Clerk v6
  const { userId } = await auth();

  if (!userId) return null;

  // Fetch user from DB with business relations
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedBusinesses: {
        where: { deletedAt: null },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return user;
}

// Check if user has specific role
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  if (role === "CUSTOMER") return true;
  return user.role === role;
}

// Check if user has any of the specified roles
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  return roles.includes(user.role);
}

// Upgrade user to business owner
export async function upgradeToBusinessOwner(userId: string) {
  // 1. Update in database
  await prisma.user.update({
    where: { id: userId },
    data: { role: "BUSINESS_OWNER" },
  });

  // 2. Update Clerk metadata (clerkClient is now an async factory)
  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: {
      role: "BUSINESS_OWNER",
      roles: ["CUSTOMER", "BUSINESS_OWNER"],
    },
  });

  // 3. Invalidate cache tags (Next.js 16 best practice)
  updateTag(`user-auth-${userId}`);
}

// Make user admin (restricted)
export async function makeAdmin(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" },
  });

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: {
      role: "ADMIN",
      roles: ["CUSTOMER", "BUSINESS_OWNER", "ADMIN"],
    },
  });

  updateTag(`user-auth-${userId}`);
}

// Ban user
export async function banUser(userId: string, reason: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isBanned: true,
      bannedReason: reason,
      isActive: false,
    },
  });

  const client = await clerkClient();
  await client.users.banUser(userId);

  updateTag(`user-auth-${userId}`);
}

// Check if user owns a business
export async function ownsBusinesses(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const businessCount = await prisma.business.count({
    where: {
      ownerId: user.id,
      deletedAt: null,
    },
  });

  return businessCount > 0;
}

// Require authentication
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

// Require specific role
export async function requireRole(role: UserRole) {
  const user = await requireAuth();

  if (user.role !== role && user.role !== "ADMIN") {
    throw new Error(`Requires ${role} role`);
  }

  return user;
}

// ==================== NEW DASHBOARD FUNCTIONS ====================

/**
 * Get authenticated user with redirect (for dashboard pages)
 * Similar to getCurrentUser but redirects if not authenticated
 */
export async function getAuthUserOrRedirect() {
  try {
    const { userId } = await auth();

    if (!userId) {
      redirect("/sign-in");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedBusinesses: {
          where: { deletedAt: null },
          include: {
            _count: {
              select: {
                reviews: true,
                bookings: true,
                orders: true,
                photos: true,
                complaints: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      redirect("/sign-in");
    }

    return user;
  } catch (error) {
    console.error("[AUTH] Error fetching user:", error);
    throw error;
  }
}

/**
 * Get current user's business for dashboard access
 * Validates business owner role and business status
 */
// lib/auth.ts - Update only the getCurrentBusiness function

/**
 * Get current user's business for dashboard access
 * Validates business owner role and business status
 */
export async function getCurrentBusiness() {
  try {
    const user = await getAuthUserOrRedirect();

    // Check if user has BUSINESS_OWNER role
    if (user.role !== "BUSINESS_OWNER") {
      return {
        success: false,
        error: "INVALID_ROLE",
        message: "You must be a business owner to access this page.",
      };
    }

    // Check if user has a business
    if (!user.ownedBusinesses || user.ownedBusinesses.length === 0) {
      return {
        success: false,
        error: "NO_BUSINESS",
        message: "You don't have a registered business yet.",
      };
    }

    // Get the first business (one user = one business per requirements)
    const business = user.ownedBusinesses[0];

    // Check if business is suspended or closed
    if (business.status === "SUSPENDED" || business.status === "CLOSED") {
      return {
        success: false,
        error: "BUSINESS_SUSPENDED",
        message: `Your business is ${business.status.toLowerCase()}. Please contact support.`,
        business,
      };
    }
    return {
      success: true,
      business,
      user,
    };
  } catch (error) {
    console.error("[ERROR] getCurrentBusiness - Exception:", error);
    return {
      success: false,
      error: "INTERNAL_ERROR",
      message: "An error occurred while fetching your business.",
    };
  }
}

/**
 * Verify user has access to specific business
 * @param businessId - Business ID to check
 */
export async function verifyBusinessAccess(businessId: string) {
  try {
    const user = await getAuthUserOrRedirect();

    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: user.id,
        deletedAt: null,
      },
    });

    if (!business) {
      return {
        success: false,
        error: "UNAUTHORIZED",
        message: "You don't have access to this business.",
      };
    }

    // Check status
    if (business.status === "SUSPENDED" || business.status === "CLOSED") {
      return {
        success: false,
        error: "BUSINESS_SUSPENDED",
        message: `This business is ${business.status.toLowerCase()}.`,
      };
    }

    return {
      success: true,
      business,
    };
  } catch (error) {
    console.error("[AUTH] Error verifying business access:", error);
    return {
      success: false,
      error: "INTERNAL_ERROR",
      message: "An error occurred while verifying access.",
    };
  }
}

/**
 * Get current Clerk user info (raw Clerk data)
 */
export async function getClerkUser() {
  try {
    const user = await currentUser();
    return user;
  } catch (error) {
    console.error("[AUTH] Error fetching Clerk user:", error);
    return null;
  }
}

/**
 * Get user's first business (convenience function for dashboard)
 * Returns null if no business found
 */
export async function getUserBusiness() {
  const user = await getCurrentUser();

  if (!user || !user.ownedBusinesses || user.ownedBusinesses.length === 0) {
    return null;
  }

  // Get full business details
  const business = await prisma.business.findUnique({
    where: {
      id: user.ownedBusinesses[0].id,
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          reviews: true,
          bookings: true,
          orders: true,
          photos: true,
          complaints: true,
        },
      },
    },
  });

  return business;
}

/**
 * Check if business is accessible (not suspended/closed)
 */
export async function isBusinessAccessible(
  businessId: string
): Promise<boolean> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { status: true },
  });

  if (!business) return false;

  return business.status !== "SUSPENDED" && business.status !== "CLOSED";
}
