"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma"; // Assuming your prisma client location
import { onboardingSchema } from "@/lib/onboarding/validations/onboarding";

export const completeOnboarding = async (rawData: unknown) => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // 1. Validate data against our Zod schema (Production-level safety)
  const validatedFields = onboardingSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = validatedFields.data;
  const client = await clerkClient();

  try {
    // 2. Perform Database and Clerk updates
    // Using a Promise.all or similar isn't strictly an 'atomic transaction' across two different services,
    // but we execute the DB write first as it's our "Source of Truth".

    await prisma.user.upsert({
      where: { id: userId }, // Using Clerk's userId as our primary key 'cuid' or mapping email
      update: {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        defaultPincode: data.pincode,
        defaultCity: data.city,
        defaultState: data.state,
        defaultLatitude: data.latitude,
        defaultLongitude: data.longitude,
      },
      create: {
        id: userId,
        email: (
          await client.users.getUser(userId)
        ).emailAddresses[0].emailAddress,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        defaultPincode: data.pincode,
        defaultCity: data.city,
        defaultState: data.state,
        defaultLatitude: data.latitude,
        defaultLongitude: data.longitude,
      },
    });

    // 3. Update Clerk Metadata so middleware/UI knows onboarding is done
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Onboarding Error:", err);
    return { error: "Database synchronization failed. Please try again." };
  }
};
