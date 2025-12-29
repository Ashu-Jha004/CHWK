// lib/validations/business.ts
import { z } from "zod";

/**
 * Phone number validation (Indian format)
 */
const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number is too long")
  .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number");

/**
 * Email validation
 */
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

/**
 * PIN code validation (Indian format)
 */
const pincodeSchema = z
  .string()
  .length(6, "PIN code must be exactly 6 digits")
  .regex(/^\d{6}$/, "PIN code must contain only digits");

/**
 * URL validation (optional)
 */
const urlSchema = z
  .string()
  .url("Please enter a valid URL")
  .or(z.literal(""))
  .optional()
  .nullable();

/**
 * Basic Info Schema
 */
export const basicInfoSchema = z.object({
  // Basic Details
  name: z
    .string()
    .min(3, "Business name must be at least 3 characters")
    .max(100, "Business name is too long"),

  description: z
    .string()
    .max(2000, "Description is too long (max 2000 characters)")
    .optional()
    .nullable(),

  shortDescription: z
    .string()
    .max(255, "Short description is too long (max 255 characters)")
    .optional()
    .nullable(),

  // Contact Information
  email: emailSchema,

  phone: phoneSchema,

  alternatePhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number")
    .optional()
    .nullable()
    .or(z.literal("")),

  whatsappNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit WhatsApp number")
    .optional()
    .nullable()
    .or(z.literal("")),

  website: urlSchema,

  // Location
  addressLine1: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(255, "Address is too long"),

  addressLine2: z
    .string()
    .max(255, "Address line 2 is too long")
    .optional()
    .nullable(),

  landmark: z.string().max(100, "Landmark is too long").optional().nullable(),

  area: z.string().max(100, "Area is too long").optional().nullable(),

  city: z.string().min(2, "City is required").max(100, "City name is too long"),

  district: z
    .string()
    .max(100, "District name is too long")
    .optional()
    .nullable(),

  state: z
    .string()
    .min(2, "State is required")
    .max(100, "State name is too long"),

  pincode: pincodeSchema,

  // Chain Information (optional)
  chainId: z.string().optional().nullable(),

  branchName: z
    .string()
    .max(100, "Branch name is too long")
    .optional()
    .nullable(),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
