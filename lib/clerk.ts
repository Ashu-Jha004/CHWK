import { clerkClient } from "@clerk/nextjs/server";

// User metadata structure in Clerk
export interface UserMetadata {
  role: "CUSTOMER" | "BUSINESS_OWNER" | "ADMIN" | "MODERATOR";
  roles: string[];
  onboardingCompleted: boolean;
  businessIds?: string[];
}

// Set user role (called after sign-up or role upgrade)
export async function setUserRole(userId: string, role: UserMetadata["role"]) {
  // 1. Initialize the client (New in updated version)
  const client = await clerkClient();

  // 2. Fetch the user
  const user = await client.users.getUser(userId);
  const currentRoles = (user.publicMetadata.roles as string[]) || [];

  // Add role if not already present
  if (!currentRoles.includes(role)) {
    currentRoles.push(role);
  }

  // 3. Update the user metadata
  await client.users.updateUser(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      role: currentRoles[0], // Primary role
      roles: currentRoles,
    },
  });
}

// Check if user has specific role
// Note: 'user' here can be from useUser() on client or auth() on server
export function hasRole(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any,
  requiredRole: UserMetadata["role"]
): boolean {
  const roles = (user?.publicMetadata?.roles as string[]) || [];
  return roles.includes(requiredRole);
}

// Upgrade customer to business owner
export async function upgradeToBusinessOwner(userId: string) {
  await setUserRole(userId, "BUSINESS_OWNER");
}
