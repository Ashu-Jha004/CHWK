/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/business-dashboard/use-service-areas.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addServiceArea,
  updateServiceArea,
  deleteServiceArea,
  getServiceAreas,
  bulkServiceAreaOperation,
} from "@/app/(businesses)/business/actions/service-area-actions";
import type {
  ServiceAreaFormData,
  BulkServiceAreaData,
} from "@/lib/validations/business-dashboard/profile/service-area";

// ==================== QUERY: GET SERVICE AREAS ====================

export function useServiceAreas(businessId: string) {
  return useQuery({
    queryKey: ["service-areas", businessId],
    queryFn: async () => {
      const response = await getServiceAreas(businessId);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch service areas");
      }

      return response.data || [];
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// ==================== MUTATION: ADD SERVICE AREA ====================

export function useAddServiceArea(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ServiceAreaFormData) => {
      const response = await addServiceArea(businessId, data);

      if (!response.success) {
        throw new Error(response.error || "Failed to add service area");
      }

      return response;
    },

    onSuccess: (data) => {
      toast.success("Service area added successfully");

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["service-areas", businessId],
      });

      console.log("[USE_ADD_SERVICE_AREA] Success:", data);
    },

    onError: (error: Error) => {
      toast.error("Failed to add service area", {
        description: error.message,
      });

      console.error("[USE_ADD_SERVICE_AREA] Error:", error);
    },
  });
}

// ==================== MUTATION: UPDATE SERVICE AREA ====================

export function useUpdateServiceArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      areaId,
      data,
    }: {
      areaId: string;
      data: ServiceAreaFormData;
    }) => {
      const response = await updateServiceArea(areaId, data);

      if (!response.success) {
        throw new Error(response.error || "Failed to update service area");
      }

      return response;
    },

    onSuccess: (data) => {
      toast.success("Service area updated successfully");

      // Invalidate all service-areas queries
      queryClient.invalidateQueries({
        queryKey: ["service-areas"],
      });

      console.log("[USE_UPDATE_SERVICE_AREA] Success:", data);
    },

    onError: (error: Error) => {
      toast.error("Failed to update service area", {
        description: error.message,
      });

      console.error("[USE_UPDATE_SERVICE_AREA] Error:", error);
    },
  });
}

// ==================== MUTATION: DELETE SERVICE AREA ====================

export function useDeleteServiceArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (areaId: string) => {
      const response = await deleteServiceArea(areaId);

      if (!response.success) {
        throw new Error(response.error || "Failed to delete service area");
      }

      return response;
    },

    onSuccess: (data) => {
      toast.success("Service area deleted successfully");

      // Invalidate all service-areas queries
      queryClient.invalidateQueries({
        queryKey: ["service-areas"],
      });

      console.log("[USE_DELETE_SERVICE_AREA] Success:", data);
    },

    onError: (error: Error) => {
      toast.error("Failed to delete service area", {
        description: error.message,
      });

      console.error("[USE_DELETE_SERVICE_AREA] Error:", error);
    },
  });
}

// ==================== MUTATION: BULK OPERATIONS ====================

export function useBulkServiceAreaOperation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (operationData: BulkServiceAreaData) => {
      const response = await bulkServiceAreaOperation(
        businessId,
        operationData
      );

      if (!response.success) {
        throw new Error(response.error || "Bulk operation failed");
      }

      return response;
    },

    onSuccess: (data, variables) => {
      const actionPastTense =
        variables.action === "enable"
          ? "enabled"
          : variables.action === "disable"
          ? "disabled"
          : "deleted";

      toast.success(`Service areas ${actionPastTense} successfully`);

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["service-areas", businessId],
      });

      console.log("[USE_BULK_SERVICE_AREA] Success:", data);
    },

    onError: (error: Error) => {
      toast.error("Bulk operation failed", {
        description: error.message,
      });

      console.error("[USE_BULK_SERVICE_AREA] Error:", error);
    },
  });
}

// ==================== HELPER: CHECK IF ANY AREAS EXIST ====================

export function useHasServiceAreas(businessId: string) {
  const { data: areas } = useServiceAreas(businessId);
  return (areas?.length || 0) > 0;
}

// ==================== HELPER: GET ACTIVE AREAS COUNT ====================

export function useActiveServiceAreasCount(businessId: string) {
  const { data: areas } = useServiceAreas(businessId);
  return areas?.filter((area: any) => area.isActive).length || 0;
}
