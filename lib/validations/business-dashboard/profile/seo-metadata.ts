// lib/validations/business-dashboard/profile/seo-metadata.ts
import { z } from "zod";

export const seoMetadataSchema = z.object({
  metaTitle: z
    .string()
    .max(60, "Title exceeds recommended 60 characters")
    .optional()
    .or(z.literal("")),
  metaDescription: z
    .string()
    .max(160, "Description exceeds recommended 160 characters")
    .optional()
    .or(z.literal("")),
  // Changed: Removed .optional() and ensured a strict default array
  metadataKeywords: z
    .array(z.string().min(2).max(30))
    .max(25, "Maximum 25 keywords allowed")
    .default([]),
});

export type SEOMetadataFormData = z.infer<typeof seoMetadataSchema>;
