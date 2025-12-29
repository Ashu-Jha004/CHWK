// hooks/business-dashboard/use-service-settings.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  updateServiceSettings,
  getServiceSettings,
} from "@/app/(businesses)/business/actions/update-service-settings";
import type { ServiceSettingsFormData } from "@/lib/validations/business-dashboard/profile/service-settings";

// ==================== QUERY: GET SERVICE SETTINGS ====================

export function useServiceSettings(businessId: string) {
  return useQuery({
    queryKey: ["service-settings", businessId],
    queryFn: async () => {
      const response = await getServiceSettings(businessId);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch service settings");
      }

      return response.data;
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// ==================== MUTATION: UPDATE SERVICE SETTINGS ====================

export function useUpdateServiceSettings(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ServiceSettingsFormData) => {
      const response = await updateServiceSettings(businessId, data);

      if (!response.success) {
        throw new Error(response.error || "Failed to update service settings");
      }

      return response;
    },

    onSuccess: (data) => {
      // Show success toast
      toast.success("Service settings updated successfully");

      // Invalidate and refetch queries
      queryClient.invalidateQueries({
        queryKey: ["service-settings", businessId],
      });

      queryClient.invalidateQueries({
        queryKey: ["business", businessId],
      });

      console.log("[USE_UPDATE_SERVICE_SETTINGS] Success:", data);
    },

    onError: (error: Error) => {
      // Show error toast
      toast.error("Failed to update service settings", {
        description: error.message,
      });

      console.error("[USE_UPDATE_SERVICE_SETTINGS] Error:", error);
    },
  });
}

// ==================== HELPER: CHECK IF SETTINGS ARE COMPLETE ====================

export function useServiceSettingsComplete(businessId: string) {
  const { data: settings } = useServiceSettings(businessId);

  if (!settings) return false;

  // Check if at least one service offering is enabled
  const hasServiceOffering =
    settings.offersProducts ||
    settings.offersServices ||
    settings.offersDineIn ||
    settings.offersDelivery ||
    settings.offersPickup ||
    settings.offersOnline ||
    settings.offersOnSite;

  // Check if at least one payment method is enabled
  const hasPaymentMethod =
    settings.acceptsCash ||
    settings.acceptsUPI ||
    settings.acceptsCards ||
    settings.acceptsNetBanking ||
    settings.acceptsWallets;

  return hasServiceOffering && hasPaymentMethod;
}
