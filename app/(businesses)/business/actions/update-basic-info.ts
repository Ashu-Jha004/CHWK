/* eslint-disable @typescript-eslint/no-explicit-any */
// actions/business/update-basic-info.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyBusinessAccess } from "@/lib/auth";
import {
  basicInfoSchema,
  BasicInfoFormData,
} from "@/lib/validations/business-dashboard/profile/business";
import { ApiResponse } from "@/types/businessDashboard/dashboard-types";

/**
 * Update business basic information
 */
export async function updateBasicInfo(
  businessId: string,
  data: BasicInfoFormData
): Promise<ApiResponse> {
  try {
    console.log(
      "[UPDATE_BASIC_INFO] Starting update for business:",
      businessId
    );

    // Verify user has access to this business
    const accessCheck = await verifyBusinessAccess(businessId);

    if (!accessCheck.success) {
      console.error("[UPDATE_BASIC_INFO] Access denied:", accessCheck.error);
      return {
        success: false,
        error: accessCheck.message || "Access denied",
      };
    }

    // Validate input data
    const validation = basicInfoSchema.safeParse(data);

    if (!validation.success) {
      console.error("[UPDATE_BASIC_INFO] Validation failed:", validation.error);
      return {
        success: false,
        error: "Invalid data provided",
        message: validation.error.issues[0]?.message || "Validation failed",
      };
    }

    const validatedData = validation.data;

    // Clean empty strings to null
    const cleanData = {
      name: validatedData.name,
      description: validatedData.description || null,
      shortDescription: validatedData.shortDescription || null,
      email: validatedData.email,
      phone: validatedData.phone,
      alternatePhone: validatedData.alternatePhone || null,
      whatsappNumber: validatedData.whatsappNumber || null,
      website: validatedData.website || null,
      addressLine1: validatedData.addressLine1,
      addressLine2: validatedData.addressLine2 || null,
      landmark: validatedData.landmark || null,
      area: validatedData.area || null,
      city: validatedData.city,
      district: validatedData.district || null,
      state: validatedData.state,
      pincode: validatedData.pincode,
      chainId: validatedData.chainId || null,
      branchName: validatedData.branchName || null,
      updatedAt: new Date(),
    };

    // Update business in database
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: cleanData,
      select: {
        id: true,
        name: true,
        slug: true,
        updatedAt: true,
      },
    });

    console.log(
      "[UPDATE_BASIC_INFO] Successfully updated business:",
      updatedBusiness.id
    );

    // Revalidate paths
    revalidatePath("/business/dashboard");
    revalidatePath(`/business/${updatedBusiness.slug}`);

    return {
      success: true,
      message: "Basic information updated successfully",
      data: updatedBusiness,
    };
  } catch (error) {
    console.error("[UPDATE_BASIC_INFO] Error:", error);

    // Handle unique constraint violations
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string; meta?: any };

      if (prismaError.code === "P2002") {
        const field = prismaError.meta?.target?.[0] || "field";
        return {
          success: false,
          error: `A business with this ${field} already exists`,
        };
      }
    }

    return {
      success: false,
      error: "Failed to update business information. Please try again.",
    };
  }
}
