import { z } from "zod";
import { PricingType, DeliveryType, ServiceType } from "@prisma/client";

// ==================== MENU ITEM (UNIVERSAL) VALIDATION ====================

export const menuItemSchema = z
  .object({
    // Basic Info
    name: z
      .string()
      .trim()
      .min(1, "Item name is required")
      .min(2, "Item name must be at least 2 characters")
      .max(200, "Item name cannot exceed 200 characters"),

    categoryId: z
      .string()
      .min(1, "Category is required")
      .optional()
      .nullable()
      .or(z.literal("")),

    description: z
      .string()
      .max(2000, "Description cannot exceed 2000 characters")
      .nullable()
      .optional(),

    // Type Classification - Removed objects to avoid 'errorMap' and 'required_error' issues
    itemType: z.nativeEnum(ServiceType),
    deliveryType: z.nativeEnum(DeliveryType),
    pricingType: z.nativeEnum(PricingType),

    // Pricing
    basePrice: z
      .number()
      .min(0, "Base price cannot be negative")
      .max(1000000, "Base price seems too high")
      .nullable()
      .optional(),

    salePrice: z
      .number()
      .min(0, "Sale price cannot be negative")
      .max(1000000, "Sale price seems too high")
      .nullable()
      .optional(),

    hourlyRate: z
      .number()
      .min(0, "Hourly rate cannot be negative")
      .max(100000, "Hourly rate seems too high")
      .nullable()
      .optional(),

    dailyRate: z
      .number()
      .min(0, "Daily rate cannot be negative")
      .max(1000000, "Daily rate seems too high")
      .nullable()
      .optional(),

    priceNote: z
      .string()
      .max(500, "Price note cannot exceed 500 characters")
      .nullable()
      .optional(),

    // Service-specific
    serviceDuration: z
      .number()
      .int("Service duration must be a whole number")
      .min(5, "Service duration must be at least 5 minutes")
      .max(1440, "Service duration cannot exceed 24 hours (1440 minutes)")
      .nullable()
      .optional(),

    requiresBooking: z.boolean(),

    bufferTime: z
      .number()
      .int("Buffer time must be a whole number")
      .min(0, "Buffer time cannot be negative")
      .max(480, "Buffer time cannot exceed 8 hours (480 minutes)")
      .nullable()
      .optional(),

    // Availability
    isAvailable: z.boolean(),

    availableDays: z.array(z.string()).nullable().optional(),

    availableOnline: z.boolean(),
    availableAtLocation: z.boolean(),
    availableOnSite: z.boolean(),

    maxTravelDistance: z
      .number()
      .min(0, "Max travel distance cannot be negative")
      .max(500, "Max travel distance cannot exceed 500 km")
      .nullable()
      .optional(),

    // Attributes
    isVeg: z.boolean().nullable().optional(),
    isVegan: z.boolean().nullable().optional(),
    isGlutenFree: z.boolean().nullable().optional(),
    isSpicy: z.boolean().nullable().optional(),
    spicyLevel: z.number().int().min(1).max(5).nullable().optional(),

    // Additional Info
    skillLevel: z.string().max(100).nullable().optional(),
    certification: z.string().max(200).nullable().optional(),
    cancellationPolicy: z.string().max(1000).nullable().optional(),

    // Tags & SEO
    tags: z.array(z.string()).max(20).optional(),
    allergens: z.array(z.string()).max(20).optional(),

    // Display
    displayOrder: z.number().int().min(0).optional(),
    isFeatured: z.boolean(),
    isRecommended: z.boolean(),

    // Inventory
    stockQuantity: z.number().int().nullable().optional(),

    // Image
    image: z.string().url("Invalid image URL").nullable().optional(),
  })
  // ==================== REFINEMENTS ====================
  .refine((data) => !!data.itemType, {
    message: "Item type is required",
    path: ["itemType"],
  })
  .refine((data) => !!data.deliveryType, {
    message: "Delivery type is required",
    path: ["deliveryType"],
  })
  .refine((data) => !!data.pricingType, {
    message: "Pricing type is required",
    path: ["pricingType"],
  })
  .refine(
    (data) =>
      data.pricingType !== "FIXED" ||
      (data.basePrice !== null && data.basePrice !== undefined),
    {
      message: "Base price is required for fixed pricing",
      path: ["basePrice"],
    }
  )
  .refine((data) => data.pricingType !== "HOURLY" || !!data.hourlyRate, {
    message: "Hourly rate is required for hourly pricing",
    path: ["hourlyRate"],
  })
  .refine((data) => data.pricingType !== "DAILY" || !!data.dailyRate, {
    message: "Daily rate is required for daily pricing",
    path: ["dailyRate"],
  })
  .refine(
    (data) =>
      !(data.basePrice && data.salePrice && data.salePrice > data.basePrice),
    {
      message: "Sale price cannot be higher than base price",
      path: ["salePrice"],
    }
  )
  .refine(
    (data) =>
      !data.availableOnSite ||
      (data.maxTravelDistance !== null && data.maxTravelDistance !== undefined),
    {
      message: "Max travel distance is required for on-site services",
      path: ["maxTravelDistance"],
    }
  )
  .refine(
    (data) =>
      data.availableOnline || data.availableAtLocation || data.availableOnSite,
    {
      message: "Please select at least one availability option",
      path: ["availableOnline"],
    }
  );

export type MenuItemFormData = z.infer<typeof menuItemSchema>;

// ==================== BULK OPERATIONS VALIDATION ====================

export const bulkItemOperationSchema = z
  .object({
    itemIds: z
      .array(z.string().cuid())
      .min(1, "Please select at least one item"),

    action: z.enum(["enable", "disable", "delete", "change-category"]),

    targetCategoryId: z.string().cuid().optional(),
  })
  .refine(
    (data) => data.action !== "change-category" || !!data.targetCategoryId,
    {
      message: "Target category is required for change-category action",
      path: ["targetCategoryId"],
    }
  );

export type BulkItemOperationData = z.infer<typeof bulkItemOperationSchema>;
