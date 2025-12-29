// actions/business/update-business-categories.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyBusinessAccess } from "@/lib/auth";
import { ApiResponse } from "@/types/businessDashboard/dashboard-types";

/**
 * Update business categories
 */
export async function updateBusinessCategories(
  businessId: string,
  data: {
    categoryIds: string[];
    primaryCategoryId: string;
  }
): Promise<ApiResponse> {
  try {
    const accessCheck = await verifyBusinessAccess(businessId);

    if (!accessCheck.success) {
      return {
        success: false,
        error: "Access denied",
      };
    }

    // Validate that primary category is in the list
    if (!data.categoryIds.includes(data.primaryCategoryId)) {
      return {
        success: false,
        error: "Primary category must be in the selected categories",
      };
    }

    // Delete existing categories and create new ones in a transaction
    await prisma.$transaction([
      // Delete existing categories
      prisma.businessCategory.deleteMany({
        where: { businessId },
      }),

      // Create new categories
      prisma.businessCategory.createMany({
        data: data.categoryIds.map((categoryId, index) => ({
          businessId,
          categoryId,
          isPrimary: categoryId === data.primaryCategoryId,
          displayOrder: index,
        })),
      }),
    ]);

    revalidatePath("/business/dashboard");

    return {
      success: true,
      message: "Categories updated successfully",
    };
  } catch (error) {
    console.error("[UPDATE_CATEGORIES] Error:", error);
    return {
      success: false,
      error: "Failed to update categories",
    };
  }
}

/**
 * Update business amenities
 */
export async function updateBusinessAmenities(
  businessId: string,
  amenityIds: string[]
): Promise<ApiResponse> {
  try {
    const accessCheck = await verifyBusinessAccess(businessId);

    if (!accessCheck.success) {
      return {
        success: false,
        error: "Access denied",
      };
    }

    // Delete existing amenities and create new ones in a transaction
    await prisma.$transaction([
      // Delete existing amenities
      prisma.businessAmenity.deleteMany({
        where: { businessId },
      }),

      // Create new amenities
      prisma.businessAmenity.createMany({
        data: amenityIds.map((amenityId) => ({
          businessId,
          amenityId,
        })),
      }),
    ]);

    revalidatePath("/business/dashboard");

    return {
      success: true,
      message: "Amenities updated successfully",
    };
  } catch (error) {
    console.error("[UPDATE_AMENITIES] Error:", error);
    return {
      success: false,
      error: "Failed to update amenities",
    };
  }
}
