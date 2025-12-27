// lib/validations/onboarding.ts
import { z } from "zod";

export const onboardingSchema = z.object({
  // Step 1: Identity
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),

  // Step 2: Contact
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),

  // Step 3: Location (with Geolocation)
  pincode: z.string().length(6, "PIN code must be 6 digits"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
