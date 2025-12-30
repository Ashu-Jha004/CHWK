// lib/validations/legal.ts
import { DocumentType } from "@prisma/client";
import { z } from "zod";

export const documentSchema = z.object({
  type: z.nativeEnum(DocumentType, { error: "Document type is required." }),
  customName: z.string().optional(),
  fileUrl: z.string().url("Invalid file URL from Cloudinary."),
  publicId: z
    .string()
    .min(1, "Cloudinary Public ID is required for management."),
  fileType: z.string().min(1, "MIME type is required."),
});

export const businessLegalSchema = z.object({
  businessId: z.string().cuid(),
  // Validation for the mandatory PAN/GST/Aadhaar strings if you store them as fields
  // or just the document objects
  documents: z
    .array(documentSchema)
    .min(3, "At least PAN, GST, and Aadhaar are required."),
});

export type DocumentInput = z.infer<typeof documentSchema>;
