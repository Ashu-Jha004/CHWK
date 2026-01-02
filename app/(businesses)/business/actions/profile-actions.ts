// actions/business/profile-actions.ts
"use server";

import { prisma } from "@/lib/prisma"; // Adjust path based on your project
import { videoSchema } from "@/lib/validations/business-dashboard/profile/business";
import { revalidatePath } from "next/cache";

export async function updateBusinessVideo(businessId: string, videoUrl: string | null) {
  try {
    // 1. Validation Logic
    if (videoUrl) {
      const validation = videoSchema.safeParse({ introVideoUrl: videoUrl });
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0].message
        };
      }
    }

    // 2. Database Operation
    // Debug: console.log(`[DB Operation] Updating business ${businessId} with URL: ${videoUrl}`);

    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        introVideoUrl: videoUrl,
      },
    });

    // 3. Cache Invalidation for SEO and Performance
    revalidatePath(`/business/${businessId}`);
    revalidatePath(`/dashboard/business/profile`);

    return { success: true, data: updatedBusiness };

  } catch (error: any) {
    // Debugging segment
    console.error(`[Server Action Error] File: profile-actions.ts. Reason: ${error.message}`);
    return {
      success: false,
      error: "Internal Server Error: Could not update video records."
    };
  }
}