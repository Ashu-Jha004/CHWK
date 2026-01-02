// components/business-dashboard/report-review-dialog.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Flag, Send } from "lucide-react";
import { useResponseForm } from "@/hooks/reviews/use-response-form";

// ============================================
// FORM SCHEMA
// ============================================
const reportSchema = z.object({
  category: z.enum(["SPAM", "FAKE", "OFFENSIVE", "IRRELEVANT", "OTHER"], {
    message: "Please select a category",
  }),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must be less than 500 characters"),
  description: z.string().max(1000).optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

// ============================================
// COMPONENT PROPS
// ============================================
interface ReportReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string;
}

// ============================================
// MAIN COMPONENT
// ============================================
export function ReportReviewDialog({
  open,
  onOpenChange,
  reviewId,
}: ReportReviewDialogProps) {
  const { reportReview, isSubmitting } = useResponseForm({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      category: undefined,
      reason: "",
      description: "",
    },
  });

  const category = watch("category");

  // ============================================
  // HANDLERS
  // ============================================
  const onSubmit = async (data: ReportFormValues) => {
    try {
      await reportReview({
        reviewId,
        category: data.category,
        reason: data.reason,
        description: data.description,
      });
      reset();
    } catch (error) {
      console.error("Report submission failed:", error);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report Review
          </DialogTitle>
          <DialogDescription>
            Report this review to admins for spam, fake content, or violations. Our team will review it and take appropriate action.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Report Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(value) => setValue("category", value as any)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPAM">Spam or Promotional</SelectItem>
                <SelectItem value="FAKE">Fake or Fraudulent</SelectItem>
                <SelectItem value="OFFENSIVE">Offensive Content</SelectItem>
                <SelectItem value="IRRELEVANT">Irrelevant to Business</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Briefly explain why you're reporting this review..."
              rows={3}
              {...register("reason")}
              maxLength={500}
              className="resize-none"
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional context that might help our review..."
              rows={3}
              {...register("description")}
              maxLength={1000}
              className="resize-none"
            />
          </div>

          {/* Warning Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              False reports may result in action against your account. Only report reviews that genuinely violate our policies.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
