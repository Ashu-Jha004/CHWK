import { z } from "zod";

// ==================== SERVICE SETTINGS VALIDATION ====================

export const serviceSettingsSchema = z
  .object({
    // Service Offerings
    offersProducts: z.preprocess((val) => Boolean(val), z.boolean()),
    offersServices: z.preprocess((val) => Boolean(val), z.boolean()),
    offersDineIn: z.boolean(),
    offersDelivery: z.boolean(),
    offersPickup: z.boolean(),
    offersOnline: z.boolean(),
    offersOnSite: z.boolean(),

    // Service Radius
    serviceRadiusKm: z
      .number()
      .positive("Service radius must be greater than 0")
      .max(200, "Service radius cannot exceed 200 km")
      .nullable()
      .optional(),

    // Payment Methods
    acceptsCash: z.boolean(),
    acceptsUPI: z.boolean(),
    acceptsCards: z.boolean(),
    acceptsNetBanking: z.boolean(),
    acceptsWallets: z.boolean(),
    requiresAdvancePayment: z.boolean(),
    advancePaymentPercent: z
      .number()
      .int("Advance payment percentage must be a whole number")
      .min(0, "Advance payment percentage cannot be negative")
      .max(100, "Advance payment percentage cannot exceed 100")
      .nullable()
      .optional(),

    // Booking Settings
    acceptsBookings: z.boolean(),
    minAdvanceBookingHours: z
      .number()
      .int("Minimum booking hours must be a whole number")
      .min(0, "Minimum booking hours cannot be negative")
      .max(720, "Minimum booking hours cannot exceed 30 days (720 hours)")
      .nullable()
      .optional(),
    maxAdvanceBookingDays: z
      .number()
      .int("Maximum booking days must be a whole number")
      .min(1, "Maximum booking days must be at least 1")
      .max(365, "Maximum booking days cannot exceed 365")
      .nullable()
      .optional(),
  })
  // Better Alternative: Handle required/invalid errors in refines to avoid Type errors
  .refine(
    (data) => {
      return (
        data.offersProducts ||
        data.offersServices ||
        data.offersDineIn ||
        data.offersDelivery ||
        data.offersPickup ||
        data.offersOnline ||
        data.offersOnSite
      );
    },
    {
      message: "Please select at least one service offering",
      path: ["offersProducts"],
    }
  )
  .refine(
    (data) => {
      return (
        data.acceptsCash ||
        data.acceptsUPI ||
        data.acceptsCards ||
        data.acceptsNetBanking ||
        data.acceptsWallets
      );
    },
    {
      message: "Please select at least one payment method",
      path: ["acceptsCash"],
    }
  )
  .refine(
    (data) => {
      if (
        data.requiresAdvancePayment &&
        (data.advancePaymentPercent === null ||
          data.advancePaymentPercent === undefined)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "Advance payment percentage is required when advance payment is enabled",
      path: ["advancePaymentPercent"],
    }
  );

export type ServiceSettingsFormData = z.infer<typeof serviceSettingsSchema>;
