// components/reviews/edit-review-dialog.tsx

"use client";

import { useState, useCallback, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RatingSelector } from "./rating-selector";
import { CharacterCounter } from "./character-counter";
import { TurnstileCaptcha } from "./turnstile-captcha";
import { useReviewForm } from "@/hooks/reviews/use-review-form";
import { AlertCircle, Clock, Save } from "lucide-react";
import { formatEditTimeRemaining } from "@/lib/utils/review-utils";

// ============================================
// FORM SCHEMA
// ============================================
const editReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().max(255).optional(),
  content: z.string().min(20).max(2000).optional(),
  foodRating: z.number().min(1).max(5).optional(),
  serviceRating: z.number().min(1).max(5).optional(),
  ambienceRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
});

type EditReviewFormValues = z.infer<typeof editReviewSchema>;

// ============================================
// COMPONENT PROPS
// ============================================
interface EditReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string;
  businessId: string;
  currentData: {
    rating: number;
    title: string | null;
    content: string | null;
    foodRating: number | null;
    serviceRating: number | null;
    ambienceRating: number | null;
    valueRating: number | null;
    editableUntil: Date | null;
  };
}

// ============================================
// MAIN COMPONENT
// ============================================
export function EditReviewDialog({
  open,
  onOpenChange,
  reviewId,
  businessId,
  currentData,
}: EditReviewDialogProps) {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // ============================================
  // HOOKS
  // ============================================
  const { updateReview, isSubmitting } = useReviewForm({
    businessId,
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditReviewFormValues>({
    resolver: zodResolver(editReviewSchema),
    defaultValues: {
      rating: currentData.rating,
      title: currentData.title || "",
      content: currentData.content || "",
      foodRating: currentData.foodRating || undefined,
      serviceRating: currentData.serviceRating || undefined,
      ambienceRating: currentData.ambienceRating || undefined,
      valueRating: currentData.valueRating || undefined,
    },
  });

  // ============================================
  // WATCH FORM VALUES
  // ============================================
  const content = watch("content") || "";
  const foodRating = watch("foodRating");
  const serviceRating = watch("serviceRating");
  const ambienceRating = watch("ambienceRating");
  const valueRating = watch("valueRating");

  // ============================================
  // VALIDATION
  // ============================================
  const hasAtLeastOneRating = useMemo(() => {
    return (
      foodRating !== undefined ||
      serviceRating !== undefined ||
      ambienceRating !== undefined ||
      valueRating !== undefined
    );
  }, [foodRating, serviceRating, ambienceRating, valueRating]);

  const canSubmit = useMemo(() => {
    return (
      captchaToken !== null &&
      content.length >= 20 &&
      content.length <= 2000 &&
      hasAtLeastOneRating
    );
  }, [captchaToken, content, hasAtLeastOneRating]);

  // ============================================
  // TIME REMAINING
  // ============================================
  const timeRemaining = useMemo(() => {
    if (!currentData.editableUntil) return null;
    const now = new Date();
    const remaining = currentData.editableUntil.getTime() - now.getTime();
    return remaining > 0 ? remaining : null;
  }, [currentData.editableUntil]);

  // ============================================
  // FORM SUBMISSION
  // ============================================
  const onSubmit = async (data: EditReviewFormValues) => {
    if (!captchaToken) return;

    try {
      await updateReview(reviewId, {
        ...data,
        captchaToken,
      });
    } catch (error) {
      console.error("Review update failed:", error);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Your Review</DialogTitle>
          <DialogDescription>
            Make changes to your review. You have{" "}
            {timeRemaining ? formatEditTimeRemaining(timeRemaining) : "no time"}{" "}
            remaining to edit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Overall Rating */}
          <RatingSelector
            value={watch("rating") || 0}
            onChange={(value) => setValue("rating", value)}
            label="Overall Rating"
          />

          {/* Dimensional Ratings */}
          <div className="space-y-4">
            <Label>Detailed Ratings (at least one required)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RatingSelector
                value={foodRating || 0}
                onChange={(value) => setValue("foodRating", value)}
                label="Food"
                size="sm"
              />
              <RatingSelector
                value={serviceRating || 0}
                onChange={(value) => setValue("serviceRating", value)}
                label="Service"
                size="sm"
              />
              <RatingSelector
                value={ambienceRating || 0}
                onChange={(value) => setValue("ambienceRating", value)}
                label="Ambience"
                size="sm"
              />
              <RatingSelector
                value={valueRating || 0}
                onChange={(value) => setValue("valueRating", value)}
                label="Value"
                size="sm"
              />
            </div>
            {!hasAtLeastOneRating && (
              <p className="text-sm text-destructive">
                Please rate at least one aspect
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Review Title (Optional)</Label>
            <Input
              id="edit-title"
              placeholder="Summarize your experience..."
              {...register("title")}
              maxLength={255}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="edit-content">
              Your Review <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="edit-content"
              placeholder="Tell us about your experience..."
              rows={6}
              {...register("content")}
              maxLength={2000}
              className="resize-none"
            />
            <CharacterCounter current={content.length} min={20} max={2000} />
          </div>

          {errors.content && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.content.message}</AlertDescription>
            </Alert>
          )}

          {/* CAPTCHA */}
          <div className="space-y-2">
            <Label>Security Verification</Label>
            <TurnstileCaptcha
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
