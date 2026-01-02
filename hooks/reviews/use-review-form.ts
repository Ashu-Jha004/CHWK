// hooks/reviews/use-review-form.ts

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReviewFormData {
  businessId: string;
  rating: number;
  title?: string;
  content: string;
  visitDate?: Date;
  visitType?: string;
  orderId?: string;
  bookingId?: string;
  foodRating?: number;
  serviceRating?: number;
  ambienceRating?: number;
  valueRating?: number;
  captchaToken: string;
}

interface UseReviewFormOptions {
  businessId: string;
  onSuccess?: (reviewId: string) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for managing review form submission
 */
export function useReviewForm({ businessId, onSuccess, onError }: UseReviewFormOptions) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // SUBMIT REVIEW
  // ============================================
  const submitReview = useCallback(
    async (data: Omit<ReviewFormData, "businessId">) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await fetch("/api/reviews/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            businessId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to submit review");
        }

        toast.success("Review submitted successfully!", {
          description: "Your review is now live. Thank you for your feedback!",
        });

        // Refresh the page to show new review
        router.refresh();

        onSuccess?.(result.review.id);

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to submit review";
        setError(errorMessage);

        toast.error("Failed to submit review", {
          description: errorMessage,
        });

        onError?.(errorMessage);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [businessId, router, onSuccess, onError]
  );

  // ============================================
  // UPDATE REVIEW
  // ============================================
  const updateReview = useCallback(
    async (reviewId: string, data: Partial<Omit<ReviewFormData, "businessId">>) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await fetch("/api/reviews/update", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            reviewId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to update review");
        }

        toast.success("Review updated successfully!", {
          description: "Your changes have been saved.",
        });

        router.refresh();

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update review";
        setError(errorMessage);

        toast.error("Failed to update review", {
          description: errorMessage,
        });

        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [router]
  );

  // ============================================
  // UPLOAD PHOTO
  // ============================================
  const uploadPhoto = useCallback(async (reviewId: string, photo: File) => {
    try {
      const formData = new FormData();
      formData.append("reviewId", reviewId);
      formData.append("photo", photo);

      const response = await fetch("/api/reviews/upload-photo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to upload photo");
      }

      toast.success("Photo uploaded successfully!", {
        description: "Your review is now photo-verified.",
      });

      router.refresh();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload photo";

      toast.error("Failed to upload photo", {
        description: errorMessage,
      });

      throw err;
    }
  }, [router]);

  return {
    submitReview,
    updateReview,
    uploadPhoto,
    isSubmitting,
    error,
  };
}
