import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { UserRole } from "@prisma/client";
import { updateTag } from "next/cache"; // New in Next.js 16 for cache invalidation

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

  if (role === 'CUSTOMER') return true;
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
    data: { role: 'BUSINESS_OWNER' },
  });

  // 2. Update Clerk metadata (clerkClient is now an async factory)
  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: {
      role: 'BUSINESS_OWNER',
      roles: ['CUSTOMER', 'BUSINESS_OWNER'],
    },
  });

  // 3. Invalidate cache tags (Next.js 16 best practice)
  updateTag(`user-auth-${userId}`);
}

// Make user admin (restricted)
export async function makeAdmin(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'ADMIN' },
  });

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: {
      role: 'ADMIN',
      roles: ['CUSTOMER', 'BUSINESS_OWNER', 'ADMIN'],
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
    throw new Error('Unauthorized');
  }

  return user;
}

// Require specific role
export async function requireRole(role: UserRole) {
  const user = await requireAuth();

  if (user.role !== role && user.role !== 'ADMIN') {
    throw new Error(`Requires ${role} role`);
  }

  return user;
}