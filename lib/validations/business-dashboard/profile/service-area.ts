import { z } from "zod";

// ==================== SERVICE AREA VALIDATION ====================

// Indian pincode regex (6 digits)
const pincodeRegex = /^\d{6}$/;

export const serviceAreaSchema = z
  .object({
    areaName: z
      .string()
      .min(2, "Area name must be at least 2 characters")
      .max(100, "Area name cannot exceed 100 characters")
      .nullable()
      .optional(),

    pincode: z
      .string()
      .regex(pincodeRegex, "Pincode must be exactly 6 digits")
      .nullable()
      .optional(),

    city: z
      .string()
      .min(2, "City name must be at least 2 characters")
      .max(100, "City name cannot exceed 100 characters")
      .nullable()
      .optional(),

    deliveryFee: z
      .number() // Move custom error inside the primitive if the squiggle persists
      .min(0, "Delivery fee cannot be negative")
      .max(10000, "Delivery fee seems too high")
      .nullable()
      .optional(),

    minimumOrder: z
      .number()
      .min(0, "Minimum order cannot be negative")
      .max(100000, "Minimum order seems too high")
      .nullable()
      .optional(),

    estimatedTime: z
      .string()
      .max(50, "Estimated time cannot exceed 50 characters")
      .nullable()
      .optional(),

    // Using preprocess to ensure boolean conversion and default value
    isActive: z.preprocess(
      (val) => (val === undefined ? true : Boolean(val)),
      z.boolean()
    ),
  })
  .refine(
    (data) => {
      // At least one of areaName or pincode must be provided
      return !!(data.areaName || data.pincode);
    },
    {
      message: "Please provide either area name or pincode",
      path: ["areaName"],
    }
  );

// Export type
export type ServiceAreaFormData = z.infer<typeof serviceAreaSchema>;

// ==================== BULK SERVICE AREA OPERATIONS ====================

export const bulkServiceAreaSchema = z.object({
  areaIds: z
    .array(z.string().cuid("Invalid area ID format"))
    .min(1, "Please select at least one area"),
  action: z.enum(["enable", "disable", "delete"]),
});

export type BulkServiceAreaData = z.infer<typeof bulkServiceAreaSchema>;
