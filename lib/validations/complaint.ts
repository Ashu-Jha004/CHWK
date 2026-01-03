import { z } from "zod";

export const createComplaintSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  contactName: z.string().min(2, "Contact Name is required"),
  contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  attachments: z.array(z.string().url()).optional(),
  orderId: z.string().optional(),
  bookingId: z.string().optional(),
});

export const updateComplaintSchema = z.object({
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  adminNotes: z.string().optional(),
  resolution: z.string().optional(),
  assignedToId: z.string().optional(),
});

export type CreateComplaintValues = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintValues = z.infer<typeof updateComplaintSchema>;
