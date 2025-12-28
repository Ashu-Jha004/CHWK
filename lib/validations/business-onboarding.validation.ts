// lib/validations/business-onboarding.validation.ts
// Zod validation schemas for business onboarding steps

import { z } from "zod";
import { DayOfWeek, PriceRange } from "@prisma/client";

// ==================== STEP 1: BASIC INFO ====================

export const basicInfoSchema = z
  .object({
    name: z
      .string()
      .min(2, "Business name must be at least 2 characters")
      .max(100, "Business name must be less than 100 characters")
      .trim(),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description must be less than 2000 characters")
      .optional(),

    shortDescription: z
      .string()
      .max(255, "Short description must be less than 255 characters")
      .optional(),

    email: z
      .string()
      .email("Please enter a valid email address")
      .trim()
      .toLowerCase(),

    phone: z
      .string()
      .regex(
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit Indian mobile number"
      )
      .length(10, "Phone number must be exactly 10 digits"),

    alternatePhone: z
      .string()
      .regex(
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit Indian mobile number"
      )
      .length(10, "Alternate phone must be exactly 10 digits")
      .optional()
      .or(z.literal("")),

    whatsappNumber: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit WhatsApp number")
      .length(10, "WhatsApp number must be exactly 10 digits")
      .optional()
      .or(z.literal("")),

    website: z
      .string()
      .url("Please enter a valid website URL")
      .optional()
      .or(z.literal("")),

    // Chain information
    isPartOfChain: z.boolean(),

    chainId: z.string().optional(),

    chainName: z
      .string()
      .min(2, "Chain name must be at least 2 characters")
      .max(100, "Chain name must be less than 100 characters")
      .optional()
      .or(z.literal("")),

    branchName: z
      .string()
      .min(2, "Branch name must be at least 2 characters")
      .max(100, "Branch name must be less than 100 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // If part of chain, either chainId or chainName must be provided
      if (data.isPartOfChain) {
        return Boolean(data.chainId || data.chainName);
      }
      return true;
    },
    {
      message: "Please select an existing chain or enter a new chain name",
      path: ["chainName"],
    }
  );

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

// ==================== STEP 2: LOCATION ====================

export const locationSchema = z.object({
  latitude: z.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),

  longitude: z
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),

  addressLine1: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters")
    .trim(),

  addressLine2: z
    .string()
    .max(200, "Address line 2 must be less than 200 characters")
    .optional()
    .or(z.literal("")),

  landmark: z
    .string()
    .max(100, "Landmark must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  area: z
    .string()
    .max(100, "Area must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .min(2, "City name must be at least 2 characters")
    .max(100, "City name must be less than 100 characters")
    .trim(),

  district: z
    .string()
    .max(100, "District must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  state: z
    .string()
    .min(2, "State name must be at least 2 characters")
    .max(100, "State name must be less than 100 characters")
    .trim(),

  pincode: z
    .string()
    .regex(/^\d{6}$/, "Please enter a valid 6-digit Indian PIN code")
    .length(6, "PIN code must be exactly 6 digits"),

  isLocationDetected: z.boolean(),
  locationError: z.string().optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;

// ==================== STEP 3: CATEGORIES ====================

export const categorySchema = z.object({
  primaryCategoryId: z.string().min(1, "Please select a primary category"),

  additionalCategoryIds: z
    .array(z.string())
    .max(5, "You can select up to 5 additional categories"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// ==================== STEP 4: BUSINESS HOURS ====================

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const businessHourSchema = z
  .object({
    dayOfWeek: z.nativeEnum(DayOfWeek),
    isClosed: z.boolean(),
    openTime: z
      .string()
      .regex(timeRegex, "Invalid time format (use HH:MM)")
      .optional(),
    closeTime: z
      .string()
      .regex(timeRegex, "Invalid time format (use HH:MM)")
      .optional(),
    hasSplitShift: z.boolean(),
    splitCloseTime: z
      .string()
      .regex(timeRegex, "Invalid time format (use HH:MM)")
      .optional(),
    splitReopenTime: z
      .string()
      .regex(timeRegex, "Invalid time format (use HH:MM)")
      .optional(),
  })
  .refine(
    (data) => {
      // If not closed, must have open and close times
      if (!data.isClosed) {
        return Boolean(data.openTime && data.closeTime);
      }
      return true;
    },
    {
      message: "Please provide opening and closing times",
      path: ["openTime"],
    }
  )
  .refine(
    (data) => {
      // If split shift, must have split times
      if (data.hasSplitShift) {
        return Boolean(data.splitCloseTime && data.splitReopenTime);
      }
      return true;
    },
    {
      message: "Please provide split shift times",
      path: ["splitCloseTime"],
    }
  );

export const businessHoursSchema = z
  .object({
    is24x7: z.boolean(),
    hours: z
      .array(businessHourSchema)
      .min(1, "Please add at least one business hour"),
  })
  .refine(
    (data) => {
      // If not 24x7, must have hours
      if (!data.is24x7) {
        return data.hours.length > 0;
      }
      return true;
    },
    {
      message: "Please add business hours or mark as 24x7",
      path: ["hours"],
    }
  );

export type BusinessHoursFormData = z.infer<typeof businessHoursSchema>;

// ==================== STEP 5: BUSINESS DETAILS ====================

export const businessDetailsSchema = z
  .object({
    priceRange: z.nativeEnum(PriceRange).optional(),

    // Feature toggles
    acceptsBookings: z.boolean(),
    acceptsOrders: z.boolean(),
    hasDelivery: z.boolean(),
    hasPickup: z.boolean(),
    hasDineIn: z.boolean(),
    hasEmergencyService: z.boolean(),

    // Delivery settings
    deliveryRadius: z
      .number()
      .min(100, "Minimum delivery radius is 100 meters")
      .max(50000, "Maximum delivery radius is 50 km")
      .optional(),

    minOrderAmount: z
      .number()
      .min(0, "Minimum order amount cannot be negative")
      .max(10000, "Minimum order amount seems too high")
      .optional(),

    deliveryFee: z
      .number()
      .min(0, "Delivery fee cannot be negative")
      .max(500, "Delivery fee seems too high")
      .optional(),

    // Emergency settings
    emergencyContactNumber: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number")
      .length(10, "Emergency contact must be exactly 10 digits")
      .optional()
      .or(z.literal("")),

    emergencyExtraCharge: z
      .number()
      .min(0, "Emergency charge cannot be negative")
      .max(5000, "Emergency charge seems too high")
      .optional(),

    // Booking/Order policies
    minAdvanceBookingHours: z
      .number()
      .min(0, "Advance booking hours cannot be negative")
      .max(720, "Maximum advance booking is 30 days")
      .optional(),

    maxAdvanceBookingDays: z
      .number()
      .min(1, "Minimum is 1 day")
      .max(365, "Maximum is 365 days")
      .optional(),

    cancellationPolicy: z
      .string()
      .max(500, "Cancellation policy must be less than 500 characters")
      .optional()
      .or(z.literal("")),

    // Amenities
    amenityIds: z.array(z.string()),
  })
  .refine(
    (data) => {
      // If has delivery, must have delivery settings
      if (data.hasDelivery) {
        return Boolean(data.deliveryRadius && data.deliveryFee !== undefined);
      }
      return true;
    },
    {
      message: "Please provide delivery radius and fee",
      path: ["deliveryRadius"],
    }
  )
  .refine(
    (data) => {
      // If has emergency service, must have emergency contact
      if (data.hasEmergencyService) {
        return Boolean(data.emergencyContactNumber);
      }
      return true;
    },
    {
      message: "Please provide emergency contact number",
      path: ["emergencyContactNumber"],
    }
  );

export type BusinessDetailsFormData = z.infer<typeof businessDetailsSchema>;

// ==================== STEP 6: DOCUMENTATION ====================

const documentSchema = z.object({
  type: z.string().min(1, "Document type is required"),
  url: z.string().url("Invalid document URL"),
  fileName: z.string().min(1, "File name is required"),
});

export const documentationSchema = z.object({
  gstNumber: z
    .string()
    .regex(
      /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
      "Please enter a valid GST number"
    )
    .optional()
    .or(z.literal("")),

  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN number")
    .optional()
    .or(z.literal("")),

  documents: z
    .array(documentSchema)
    .min(
      1,
      "Please upload at least one identity document (Aadhaar/PAN/License)"
    ),
});

export type DocumentationFormData = z.infer<typeof documentationSchema>;

// ==================== STEP 7: OPTIONAL DATA ====================

const staffSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),

  designation: z
    .string()
    .max(100, "Designation must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  specialization: z
    .string()
    .max(200, "Specialization must be less than 200 characters")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number")
    .length(10, "Phone must be exactly 10 digits")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),

  yearsOfExperience: z
    .number()
    .min(0, "Experience cannot be negative")
    .max(50, "Experience seems too high")
    .optional(),
});

const serviceAreaSchema = z.object({
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Please enter a valid 6-digit PIN code")
    .optional()
    .or(z.literal("")),

  areaName: z
    .string()
    .max(100, "Area name must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .max(100, "City must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  radiusKm: z
    .number()
    .min(1, "Minimum radius is 1 km")
    .max(100, "Maximum radius is 100 km")
    .optional(),

  extraCharge: z
    .number()
    .min(0, "Extra charge cannot be negative")
    .max(1000, "Extra charge seems too high")
    .optional(),
});

const menuItemSchema = z.object({
  name: z
    .string()
    .min(2, "Item name must be at least 2 characters")
    .max(200, "Item name must be less than 200 characters"),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  price: z
    .number()
    .min(1, "Price must be at least ₹1")
    .max(100000, "Price seems too high"),

  category: z
    .string()
    .max(100, "Category must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  isVegetarian: z.boolean(),

  duration: z
    .number()
    .min(5, "Minimum duration is 5 minutes")
    .max(480, "Maximum duration is 8 hours")
    .optional(),
});

export const optionalDataSchema = z.object({
  staff: z.array(staffSchema).optional(),
  serviceAreas: z.array(serviceAreaSchema).optional(),
  menuItems: z.array(menuItemSchema).optional(),
});

export type OptionalFormData = z.infer<typeof optionalDataSchema>;

// ==================== COMPLETE FORM VALIDATION ====================

export const completeOnboardingSchema = z.object({
  basicInfo: basicInfoSchema,
  location: locationSchema,
  categories: categorySchema,
  businessHours: businessHoursSchema,
  businessDetails: businessDetailsSchema,
  documentation: documentationSchema,
  optional: optionalDataSchema,
});

export type CompleteOnboardingData = z.infer<typeof completeOnboardingSchema>;
export const photosSchema = z.object({
  logoUrl: z.string().min(1, "Business logo is required"),
  coverImageUrl: z.string().optional(),
  photoUrls: z
    .array(z.string())
    .min(3, "Please upload at least 3 photos of your business")
    .max(20, "Maximum 20 photos allowed"),
});
export type PhotosFormData = z.infer<typeof photosSchema>;
