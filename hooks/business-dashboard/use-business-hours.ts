// lib/hooks/use-business-hours.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBusinessHours } from "@/app/(businesses)/business/actions/update-business-hours";
import { BusinessHoursFormData } from "@/lib/validations/business-dashboard/profile/business-hours";
import { showToast } from "@/lib/business-onboarding/toast";

export function useUpdateBusinessHours(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BusinessHoursFormData) =>
      updateBusinessHours(businessId, data),

    onSuccess: (response) => {
      if (response.success) {
        showToast.success("Business hours updated successfully");

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ["business", businessId] });
      } else {
        showToast.error(
          "Failed to update",
          response.error || response.message || "Please try again"
        );
      }
    },

    onError: (error) => {
      console.error("[USE_BUSINESS_HOURS] Mutation error:", error);
      showToast.error(
        "Something went wrong",
        "Unable to update business hours. Please try again."
      );
    },
  });
}
