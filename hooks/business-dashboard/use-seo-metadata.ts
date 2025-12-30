/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/business-dashboard/use-seo-metadata.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBusinessSEOMetadata } from "@/app/(businesses)/business/actions/update-seo-metadata";
import { SEOMetadataFormData } from "@/lib/validations/business-dashboard/profile/seo-metadata";
import { toast } from "sonner"; // Or your preferred toast library
import { useCallback } from "react";

export function useUpdateSEOMetadata(businessId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: SEOMetadataFormData) => {
      const result = await updateBusinessSEOMetadata(businessId, data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast.success("SEO Metadata updated successfully!");
      // Invalidate queries to sync the UI
      queryClient.invalidateQueries({ queryKey: ["business", businessId] });
    },
    onError: (error: any) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });

  // Optimized wrapper for the mutation
  const executeUpdate = useCallback(
    (data: SEOMetadataFormData) => {
      mutation.mutate(data);
    },
    [mutation]
  );

  return {
    ...mutation,
    executeUpdate,
  };
}
