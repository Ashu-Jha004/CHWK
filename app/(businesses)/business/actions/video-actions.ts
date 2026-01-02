// app/actions/business/video-actions.ts
"use server";

import { prisma } from "@/lib/prisma"; // Ensure this points to your Prisma instance
import { VideoSchema } from "@/lib/video";
import { revalidatePath } from "next/cache";
import { MediaType } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

/**
 * Adds a YouTube video link to a business profile
 */
export async function addBusinessVideo(businessId: string, formData: { url: string; caption?: string }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. Validation using Zod
    const validatedFields = VideoSchema.parse(formData);

    // 2. Database Mutation
    const video = await prisma.photo.create({
      data: {
        url: validatedFields.url,
        caption: validatedFields.caption || null,
        type: MediaType.VIDEO, // Strictly set to VIDEO enum
        businessId,
        userId,
        isApproved: true, // Auto-approved for owners, adjust based on policy
      },
    });

    revalidatePath(`/business/${businessId}/dashboard`);
    return { success: true, data: video };
  } catch (error: any) {
    console.error("[VIDEO_ADD_ERROR]:", error);
    return {
      success: false,
      error: error.message || "Failed to add video. Please check the URL and try again."
    };
  }
}

/**
 * Deletes a video link
 * Uses soft-delete pattern if preferred, but here we perform a hard delete per instructions.
 */
export async function deleteBusinessVideo(videoId: string, businessId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await prisma.photo.delete({
      where: {
        id: videoId,
        userId, // Security: Ensure only the owner can delete
      },
    });

    revalidatePath(`/business/${businessId}/dashboard`);
    return { success: true };
  } catch (error: any) {
    console.error("[VIDEO_DELETE_ERROR]: Source: Prisma Mutation. Reason:", error.message);
    return { success: false, error: "Authentication failed or video not found." };
  }
}