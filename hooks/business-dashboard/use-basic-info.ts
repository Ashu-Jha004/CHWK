// lib/hooks/use-basic-info.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBasicInfo } from "@/app/(businesses)/business/actions/update-basic-info";
import { BasicInfoFormData } from "@/lib/validations/business-dashboard/profile/business";
import { showToast } from "@/lib/business-onboarding/toast";

export function useUpdateBasicInfo(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BasicInfoFormData) => updateBasicInfo(businessId, data),

    onSuccess: (response) => {
      if (response.success) {
        showToast.success("Basic information updated successfully");

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["business", businessId] });
      } else {
        showToast.error(
          "Failed to update",
          response.error || response.message || "Please try again"
        );
      }
    },

    onError: (error) => {
      console.error("[USE_BASIC_INFO] Mutation error:", error);
      showToast.error(
        "Something went wrong",
        "Unable to update business information. Please try again."
      );
    },
  });
}
