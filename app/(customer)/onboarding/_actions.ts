"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/onboarding/validations/onboarding";
import { Prisma } from "@prisma/client";

interface OnboardingResponse {
  success?: boolean;
  error?: string;
  details?: Record<string, string[]>;
}

export const completeOnboarding = async (
  rawData: unknown
): Promise<OnboardingResponse> => {
  try {
    // 1. Authentication Check
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized. Please sign in to complete onboarding." };
    }

    // 2. Validate data against Zod schema
    const validatedFields = onboardingSchema.safeParse(rawData);

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      console.error("Onboarding validation errors:", fieldErrors);

      return {
        error: "Please check all fields and try again.",
        details: fieldErrors,
      };
    }

    const data = validatedFields.data;

    // 3. Perform database and Clerk updates with transaction
    try {
      const client = await clerkClient();

      // Get user email from Clerk
      let userEmail: string;
      try {
        const clerkUser = await client.users.getUser(userId);
        const primaryEmail = clerkUser.emailAddresses.find(
          (email) => email.id === clerkUser.primaryEmailAddressId
        );
        userEmail = primaryEmail?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

        if (!userEmail) {
          return { error: "No email address found. Please contact support." };
        }
      } catch (clerkError) {
        console.error("Clerk API error:", clerkError);
        return { error: "Unable to fetch user details. Please try again." };
      }

      // Use Prisma transaction for atomicity
      await prisma.$transaction(async (tx) => {
        // Upsert user in database
        await tx.user.upsert({
          where: { id: userId },
          update: {
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            defaultPincode: data.pincode,
            defaultCity: data.city,
            defaultState: data.state,
            defaultLatitude: data.latitude ?? null,
            defaultLongitude: data.longitude ?? null,
          },
          create: {
            id: userId,
            email: userEmail,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            defaultPincode: data.pincode,
            defaultCity: data.city,
            defaultState: data.state,
            defaultLatitude: data.latitude ?? null,
            defaultLongitude: data.longitude ?? null,
          },
        });
      });

      // Update Clerk metadata (outside transaction as it's a separate service)
      try {
        await client.users.updateUser(userId, {
          publicMetadata: {
            onboardingComplete: true,
          },
        });
      } catch (clerkUpdateError) {
        console.error("Clerk metadata update error:", clerkUpdateError);
        // Don't fail the entire operation if metadata update fails
        // The user record is already created
      }

      return { success: true };

    } catch (dbError) {
      // Handle specific Prisma errors
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        if (dbError.code === "P2002") {
          // Unique constraint violation
          const target = (dbError.meta?.target as string[]) || [];
          if (target.includes("username")) {
            return { error: "This username is already taken. Please choose another." };
          }
          if (target.includes("phone")) {
            return { error: "This phone number is already registered." };
          }
          return { error: "This information is already in use." };
        }

        if (dbError.code === "P2003") {
          // Foreign key constraint violation
          return { error: "Invalid data reference. Please try again." };
        }

        if (dbError.code === "P2025") {
          // Record not found
          return { error: "User record not found. Please sign out and sign in again." };
        }
      }

      if (dbError instanceof Prisma.PrismaClientValidationError) {
        console.error("Prisma validation error:", dbError.message);
        return { error: "Data validation failed. Please check your inputs." };
      }

      // Network/connection errors
      if (
        dbError instanceof Error &&
        (dbError.message.includes("ETIMEDOUT") ||
         dbError.message.includes("ECONNREFUSED") ||
         dbError.message.includes("ENOTFOUND"))
      ) {
        console.error("Database connection error:", dbError);
        return { error: "Unable to connect to database. Please check your connection and try again." };
      }

      // Unknown database error
      console.error("Database error during onboarding:", dbError);
      throw dbError;
    }
  } catch (err) {
    // Catch-all error handler
    console.error("Unexpected onboarding error:", err);

    if (err instanceof Error) {
      // Don't expose internal errors to users
      return {
        error: "An unexpected error occurred. Please try again or contact support if the issue persists."
      };
    }

    return { error: "System error. Please try again later." };
  }
};
