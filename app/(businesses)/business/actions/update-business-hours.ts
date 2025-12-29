// actions/business/update-business-hours.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyBusinessAccess } from "@/lib/auth";
import {
  businessHoursSchema,
  BusinessHoursFormData,
} from "@/lib/validations/business-dashboard/profile/business-hours";
import { ApiResponse } from "@/types/businessDashboard/dashboard-types";

/**
 * Update business hours
 */
export async function updateBusinessHours(
  businessId: string,
  data: BusinessHoursFormData
): Promise<ApiResponse> {
  try {
    console.log("[UPDATE_HOURS] Starting update for business:", businessId);

    // Verify access
    const accessCheck = await verifyBusinessAccess(businessId);

    if (!accessCheck.success) {
      console.error("[UPDATE_HOURS] Access denied:", accessCheck.error);
      return {
        success: false,
        error: accessCheck.message || "Access denied",
      };
    }

    // Validate data
    const validation = businessHoursSchema.safeParse(data);

    if (!validation.success) {
      console.error("[UPDATE_HOURS] Validation failed:", validation.error);
      return {
        success: false,
        error: "Invalid data provided",
        message: validation.error.issues[0]?.message || "Validation failed",
      };
    }

    const validatedData = validation.data;

    // Use transaction to update business and hours atomically
    await prisma.$transaction(async (tx) => {
      // Update business 24/7 status
      await tx.business.update({
        where: { id: businessId },
        data: {
          is24x7: validatedData.is24x7,
          updatedAt: new Date(),
        },
      });

      // Delete existing regular hours (not overrides)
      await tx.businessHours.deleteMany({
        where: {
          businessId,
          isOverride: false,
        },
      });

      // If not 24/7, create new hours
      if (!validatedData.is24x7) {
        const hoursToCreate = validatedData.hours
          .filter((hour) => !hour.isClosed && hour.openTime && hour.closeTime)
          .map((hour) => ({
            businessId,
            dayOfWeek: hour.dayOfWeek,
            openTime: hour.openTime as string, // Type assertion since we filtered
            closeTime: hour.closeTime as string,
            isClosed: false,
            hasSplitShift: hour.hasSplitShift,
            splitCloseTime: hour.splitCloseTime || null,
            splitReopenTime: hour.splitReopenTime || null,
            isOverride: false,
          }));

        if (hoursToCreate.length > 0) {
          await tx.businessHours.createMany({
            data: hoursToCreate,
          });
        }
      }
    });

    console.log("[UPDATE_HOURS] Successfully updated hours");

    // Revalidate
    revalidatePath("/business/dashboard");

    return {
      success: true,
      message: "Business hours updated successfully",
    };
  } catch (error) {
    console.error("[UPDATE_HOURS] Error:", error);

    return {
      success: false,
      error: "Failed to update business hours. Please try again.",
    };
  }
}
