// hooks/reviews/use-response-form.ts

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseResponseFormOptions {
  reviewId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for managing review response operations
 */
export function useResponseForm({ reviewId, onSuccess, onError }: UseResponseFormOptions = {}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // CREATE RESPONSE
  // ============================================
  const createResponse = useCallback(
    async (reviewId: string, content: string) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await fetch("/api/reviews/responses/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewId,
            content,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to post response");
        }

        toast.success("Response posted successfully!");

        router.refresh();
        onSuccess?.();

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to post response";
        setError(errorMessage);

        toast.error("Failed to post response", {
          description: errorMessage,
        });

        onError?.(errorMessage);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, onSuccess, onError]
  );

  // ============================================
  // UPDATE RESPONSE
  // ============================================
  const updateResponse = useCallback(
    async (responseId: string, content: string) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await fetch("/api/reviews/responses/update", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            responseId,
            content,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to update response");
        }

        toast.success("Response updated successfully!");

        router.refresh();
        onSuccess?.();

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update response";
        setError(errorMessage);

        toast.error("Failed to update response", {
          description: errorMessage,
        });

        onError?.(errorMessage);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, onSuccess, onError]
  );

  // ============================================
  // DELETE RESPONSE
  // ============================================
  const deleteResponse = useCallback(
    async (responseId: string) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await fetch("/api/reviews/responses/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            responseId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to delete response");
        }

        toast.success("Response deleted successfully!");

        router.refresh();
        onSuccess?.();

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete response";
        setError(errorMessage);

        toast.error("Failed to delete response", {
          description: errorMessage,
        });

        onError?.(errorMessage);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, onSuccess, onError]
  );

  // ============================================
  // REPORT REVIEW
  // ============================================
  const reportReview = useCallback(
    async (data: {
      reviewId: string;
      reason: string;
      category: "SPAM" | "FAKE" | "OFFENSIVE" | "IRRELEVANT" | "OTHER";
      description?: string;
    }) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await fetch("/api/reviews/report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to report review");
        }

        toast.success("Review reported successfully!", {
          description: "Our team will review it shortly.",
        });

        router.refresh();
        onSuccess?.();

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to report review";
        setError(errorMessage);

        toast.error("Failed to report review", {
          description: errorMessage,
        });

        onError?.(errorMessage);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, onSuccess, onError]
  );

  return {
    createResponse,
    updateResponse,
    deleteResponse,
    reportReview,
    isSubmitting,
    error,
  };
}
