// lib/validations/review.ts

import { z } from "zod";

// ============================================
// REVIEW CREATION SCHEMA
// ============================================

export const createReviewSchema = z.object({
  businessId: z.string().cuid("Invalid business ID"),

  // Overall rating (required, 1-5)
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),

  // Title (optional, max 255 chars)
  title: z.string().max(255, "Title must be less than 255 characters").optional(),

  // Content (required, 20-2000 chars)
  content: z
    .string()
    .min(20, "Review must be at least 20 characters")
    .max(2000, "Review must be less than 2000 characters"),

  // Visit details (optional)
  visitDate: z.date().optional(),
  visitType: z.string().max(50).optional(),

  // Order/Booking reference (optional)
  orderId: z.string().cuid().optional(),
  bookingId: z.string().cuid().optional(),

  // Multi-dimensional ratings (at least one required)
  foodRating: z.number().int().min(1).max(5).optional(),
  serviceRating: z.number().int().min(1).max(5).optional(),
  ambienceRating: z.number().int().min(1).max(5).optional(),
  valueRating: z.number().int().min(1).max(5).optional(),

  // Cloudflare Turnstile token
  captchaToken: z.string().min(1, "CAPTCHA verification is required"),
}).refine(
  (data) => {
    // At least one dimensional rating must be provided
    return (
      data.foodRating !== undefined ||
      data.serviceRating !== undefined ||
      data.ambienceRating !== undefined ||
      data.valueRating !== undefined
    );
  },
  {
    message: "At least one rating (Food, Service, Ambience, or Value) is required",
    path: ["foodRating"], // Show error on first rating field
  }
);

// ============================================
// REVIEW UPDATE SCHEMA
// ============================================

export const updateReviewSchema = z.object({
  reviewId: z.string().cuid("Invalid review ID"),

  // All fields optional (user can update any field)
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(255).optional(),
  content: z.string().min(20).max(2000).optional(),

  foodRating: z.number().int().min(1).max(5).optional(),
  serviceRating: z.number().int().min(1).max(5).optional(),
  ambienceRating: z.number().int().min(1).max(5).optional(),
  valueRating: z.number().int().min(1).max(5).optional(),

  captchaToken: z.string().min(1, "CAPTCHA verification is required"),
}).refine(
  (data) => {
    // If any dimensional rating is being updated, at least one must remain
    const ratingFields = [
      data.foodRating,
      data.serviceRating,
      data.ambienceRating,
      data.valueRating,
    ].filter((r) => r !== undefined);

    // If ratings are being changed, ensure at least one is present
    if (ratingFields.length > 0) {
      return ratingFields.length >= 1;
    }
    return true;
  },
  {
    message: "At least one rating must remain",
  }
);

// ============================================
// HELPFUL VOTE SCHEMA
// ============================================

export const helpfulVoteSchema = z.object({
  reviewId: z.string().cuid("Invalid review ID"),
  isHelpful: z.boolean(),
});

// ============================================
// REVIEW FILTERS SCHEMA
// ============================================

export const reviewFiltersSchema = z.object({
  businessId: z.string().cuid("Invalid business ID"),
  sortBy: z.enum(["recent", "highest", "lowest", "helpful"]).optional().default("recent"),
  filterRating: z.enum(["all", "5", "4", "3", "2", "1"]).optional().default("all"),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(50).optional().default(10),
});

// ============================================
// TYPE EXPORTS (inferred from schemas)
// ============================================

export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
export type UpdateReviewFormData = z.infer<typeof updateReviewSchema>;
export type HelpfulVoteFormData = z.infer<typeof helpfulVoteSchema>;
export type ReviewFiltersFormData = z.infer<typeof reviewFiltersSchema>;
