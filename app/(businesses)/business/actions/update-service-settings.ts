// app/business/actions/update-service-settings.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyBusinessAccess } from "@/lib/auth";
import {
  serviceSettingsSchema,
  type ServiceSettingsFormData,
} from "@/lib/validations/business-dashboard/profile/service-settings";

// ==================== TYPES ====================

interface ServiceSettingsResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    id: string;

    // Service Offerings
    offersProducts: boolean;
    offersServices: boolean;
    offersDineIn: boolean;
    offersDelivery: boolean;
    offersPickup: boolean;
    offersOnline: boolean;
    offersOnSite: boolean;

    // Service Radius
    serviceRadiusKm: number | null;

    // Payment Methods
    acceptsCash: boolean;
    acceptsUPI: boolean;
    acceptsCards: boolean;
    acceptsNetBanking: boolean;
    acceptsWallets: boolean;
    requiresAdvancePayment: boolean;
    advancePaymentPercent: number | null;

    // Booking Settings
    acceptsBookings: boolean;
    minAdvanceBookingHours: number | null;
    maxAdvanceBookingDays: number | null;
  };
}

// ==================== UPDATE SERVICE SETTINGS ====================

export async function updateServiceSettings(
  businessId: string,
  data: ServiceSettingsFormData
): Promise<ServiceSettingsResponse> {
  try {
    console.log(
      "[UPDATE_SERVICE_SETTINGS] Starting update for business:",
      businessId
    );
    console.log(
      "[UPDATE_SERVICE_SETTINGS] Data received:",
      JSON.stringify(data, null, 2)
    );

    // 1. Verify business access
    const accessCheck = await verifyBusinessAccess(businessId);
    if (!accessCheck.success) {
      console.error(
        "[UPDATE_SERVICE_SETTINGS] Access denied:",
        accessCheck.error
      );
      return {
        success: false,
        error: accessCheck.error || "Access denied",
      };
    }

    console.log(
      "[UPDATE_SERVICE_SETTINGS] Access verified for user:",
      accessCheck.business?.ownerId
    );

    // 2. Validate data
    const validationResult = serviceSettingsSchema.safeParse(data);
    if (!validationResult.success) {
      console.error(
        "[UPDATE_SERVICE_SETTINGS] Validation failed:",
        validationResult.error.flatten()
      );
      return {
        success: false,
        error: "Invalid data provided",
        message:
          validationResult.error.issues[0]?.message || "Validation failed",
      };
    }

    const validatedData = validationResult.data;
    console.log("[UPDATE_SERVICE_SETTINGS] Data validated successfully");

    // 3. Update business settings
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        // Service Offerings
        offersProducts: validatedData.offersProducts,
        offersServices: validatedData.offersServices,
        offersDineIn: validatedData.offersDineIn || false,
        offersDelivery: validatedData.offersDelivery || false,
        offersPickup: validatedData.offersPickup || false,
        offersOnline: validatedData.offersOnline,
        offersOnSite: validatedData.offersOnSite,

        // Service Radius
        serviceRadiusKm: validatedData.serviceRadiusKm,

        // Payment Methods
        acceptsCash: validatedData.acceptsCash,
        acceptsUPI: validatedData.acceptsUPI,
        acceptsCards: validatedData.acceptsCards,
        acceptsNetBanking: validatedData.acceptsNetBanking,
        acceptsWallets: validatedData.acceptsWallets,
        requiresAdvancePayment: validatedData.requiresAdvancePayment,
        advancePaymentPercent: validatedData.advancePaymentPercent,

        // Booking Settings
        acceptsBookings: validatedData.acceptsBookings,
        minAdvanceBookingHours: validatedData.minAdvanceBookingHours,
        maxAdvanceBookingDays: validatedData.maxAdvanceBookingDays,

        // Update timestamp
        updatedAt: new Date(),
      },
      select: {
        id: true,

        // Service Offerings - ALL
        offersProducts: true,
        offersServices: true,
        offersDineIn: true,
        offersDelivery: true,
        offersPickup: true,
        offersOnline: true,
        offersOnSite: true,

        // Service Radius
        serviceRadiusKm: true,

        // Payment Methods - ALL
        acceptsCash: true,
        acceptsUPI: true,
        acceptsCards: true,
        acceptsNetBanking: true,
        acceptsWallets: true,
        requiresAdvancePayment: true,
        advancePaymentPercent: true,

        // Booking Settings
        acceptsBookings: true,
        minAdvanceBookingHours: true,
        maxAdvanceBookingDays: true,
      },
    });

    console.log(
      "[UPDATE_SERVICE_SETTINGS] Business updated successfully:",
      updatedBusiness.id
    );

    // 4. Revalidate cache
    revalidatePath("/business/dashboard");
    revalidatePath(`/business/${businessId}`);
    console.log("[UPDATE_SERVICE_SETTINGS] Cache revalidated");

    return {
      success: true,
      message: "Service settings updated successfully",
      data: updatedBusiness,
    };
  } catch (error) {
    console.error("[UPDATE_SERVICE_SETTINGS] Error:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return {
          success: false,
          error: "Business not found",
        };
      }
    }

    return {
      success: false,
      error: "Failed to update service settings. Please try again.",
    };
  }
}

// ==================== GET SERVICE SETTINGS ====================

// ==================== GET SERVICE SETTINGS ====================

export async function getServiceSettings(
  businessId: string
): Promise<ServiceSettingsResponse> {
  try {
    console.log(
      "[GET_SERVICE_SETTINGS] Fetching settings for business:",
      businessId
    );

    // Verify access
    const accessCheck = await verifyBusinessAccess(businessId);
    if (!accessCheck.success) {
      console.error("[GET_SERVICE_SETTINGS] Access denied:", accessCheck.error);
      return {
        success: false,
        error: accessCheck.error || "Access denied",
      };
    }

    // Fetch settings - SELECT ALL FIELDS
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,

        // Service Offerings - ALL OF THEM
        offersProducts: true,
        offersServices: true,
        offersDineIn: true,
        offersDelivery: true,
        offersPickup: true,
        offersOnline: true, // ← WAS MISSING
        offersOnSite: true, // ← WAS MISSING

        // Service Radius
        serviceRadiusKm: true,

        // Payment Methods - ALL OF THEM
        acceptsCash: true,
        acceptsUPI: true,
        acceptsCards: true,
        acceptsNetBanking: true, // ← WAS MISSING
        acceptsWallets: true, // ← WAS MISSING
        requiresAdvancePayment: true,
        advancePaymentPercent: true,

        // Booking Settings
        acceptsBookings: true,
        minAdvanceBookingHours: true,
        maxAdvanceBookingDays: true,
      },
    });

    if (!business) {
      console.error("[GET_SERVICE_SETTINGS] Business not found");
      return {
        success: false,
        error: "Business not found",
      };
    }

    console.log("[GET_SERVICE_SETTINGS] Settings fetched successfully");

    return {
      success: true,
      data: business,
    };
  } catch (error) {
    console.error("[GET_SERVICE_SETTINGS] Error:", error);
    return {
      success: false,
      error: "Failed to fetch service settings",
    };
  }
}
