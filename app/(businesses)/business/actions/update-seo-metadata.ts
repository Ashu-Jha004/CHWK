/* eslint-disable @typescript-eslint/no-explicit-any */
// app/_actions/business/update-seo-metadata.ts
"use server";

import { prisma } from "@/lib/prisma"; // Adjust based on your prisma client path
import {
  seoMetadataSchema,
  SEOMetadataFormData,
} from "@/lib/validations/business-dashboard/profile/seo-metadata";
import { revalidatePath } from "next/cache";

export async function updateBusinessSEOMetadata(
  businessId: string,
  rawValues: SEOMetadataFormData
) {
  try {
    // 1. Server-side validation
    const validatedData = seoMetadataSchema.safeParse(rawValues);

    if (!validatedData.success) {
      return {
        success: false,
        error: "Validation Failed",
        details: validatedData.error.flatten().fieldErrors,
      };
    }

    // 2. Optimized Database Update
    // We only touch the fields relevant to SEO
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        metaTitle: validatedData.data.metaTitle,
        metaDescription: validatedData.data.metaDescription,
        metadataKeywords: validatedData.data.metadataKeywords,
      },
      select: { id: true }, // Minimize data return
    });

    revalidatePath(`/dashboard/business/${businessId}`);

    return { success: true, id: updatedBusiness.id };
  } catch (error: any) {
    // Debugging code segment (Requirement Condition #2)
    console.error("[SEO_UPDATE_ERROR]:", {
      businessId,
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      error: "Internal Server Error",
      reason:
        error.code === "P2025"
          ? "Business record not found"
          : "Database connection failure",
    };
  }
}
