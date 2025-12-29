/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/business-dashboard/use-menu-items.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
  bulkItemOperation,
  getMenuItems,
} from "@/app/(businesses)/business/actions/menu-item-actions";
import type {
  MenuItemFormData,
  BulkItemOperationData,
} from "@/lib/validations/business-dashboard/profile/menu-item";

// ==================== QUERY: GET MENU ITEMS ====================

export function useMenuItems(businessId: string) {
  return useQuery({
    queryKey: ["menu-items", businessId],
    queryFn: async () => {
      const response = await getMenuItems(businessId);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch menu items");
      }

      return response.data || [];
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 3, // 3 minutes
    retry: 2,
  });
}

// ==================== MUTATION: CREATE MENU ITEM ====================

export function useCreateMenuItem(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      const response = await createMenuItem(businessId, data);

      if (!response.success) {
        throw new Error(response.error || "Failed to create item");
      }

      return response;
    },

    onSuccess: (data) => {
      toast.success("Item created successfully");

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["menu-items", businessId],
      });

      queryClient.invalidateQueries({
        queryKey: ["business", businessId],
      });

      console.log("[USE_CREATE_MENU_ITEM] Success:", data);
    },

    onError: (error: Error) => {
      toast.error("Failed to create item", {
        description: error.message,
      });

      console.error("[USE_CREATE_MENU_ITEM] Error:", error);
    },
  });
}

// ==================== MUTATION: UPDATE MENU ITEM ====================

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      data,
    }: {
      itemId: any;
      data: MenuItemFormData;
    }) => {
      const response = await updateMenuItem(itemId, data);

      if (!response.success) {
        throw new Error(response.error || "Failed to update item");
      }

      return response;
    },

    onSuccess: (data) => {
      toast.success("Item updated successfully");

      // Invalidate all menu-items queries
      queryClient.invalidateQueries({
        queryKey: ["menu-items"],
      });

      console.log("[USE_UPDATE_MENU_ITEM] Success:", data);
    },

    onError: (error: Error) => {
      toast.error("Failed to update item", {
        description: error.message,
      });

      console.error("[USE_UPDATE_MENU_ITEM] Error:", error);
    },
  });
}

// ==================== MUTATION: DELETE MENU ITEM ====================

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await deleteMenuItem(itemId);

      if (!response.success) {
        throw new Error(response.error || "Failed to delete item");
      }

      return response;
    },

    onSuccess: (data) => {
      toast.success("Item deleted successfully");

      // Invalidate all menu-items queries
      queryClient.invalidateQueries({
        queryKey: ["menu-items"],
      });

      console.log("[USE_DELETE_MENU_ITEM] Success:", data);
    },

    onError: (error: Error) => {
      toast.error("Failed to delete item", {
        description: error.message,
      });

      console.error("[USE_DELETE_MENU_ITEM] Error:", error);
    },
  });
}

// ==================== MUTATION: TOGGLE AVAILABILITY ====================

export function useToggleItemAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await toggleItemAvailability(itemId);

      if (!response.success) {
        throw new Error(response.error || "Failed to toggle availability");
      }

      return response;
    },

    // Optimistic update for instant UI feedback
    onMutate: async (itemId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["menu-items"] });

      // Snapshot previous value
      const previousItems = queryClient.getQueryData(["menu-items"]);

      // Optimistically update (optional - for advanced UX)
      // queryClient.setQueryData(["menu-items"], (old: any) => {
      //   return old?.map((item: any) =>
      //     item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      //   );
      // });

      return { previousItems };
    },

    onSuccess: (data) => {
      toast.success(data.message || "Availability updated");

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["menu-items"],
      });

      console.log("[USE_TOGGLE_AVAILABILITY] Success:", data);
    },

    onError: (error: Error, _itemId, context) => {
      // Rollback on error
      if (context?.previousItems) {
        queryClient.setQueryData(["menu-items"], context.previousItems);
      }

      toast.error("Failed to toggle availability", {
        description: error.message,
      });

      console.error("[USE_TOGGLE_AVAILABILITY] Error:", error);
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
}

// ==================== MUTATION: BULK OPERATIONS ====================

export function useBulkItemOperation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (operationData: BulkItemOperationData) => {
      const response = await bulkItemOperation(businessId, operationData);

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
          : variables.action === "delete"
          ? "deleted"
          : "updated";

      toast.success(`Items ${actionPastTense} successfully`, {
        description: `${data.data?.affected || 0} items affected`,
      });

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["menu-items", businessId],
      });

      console.log("[USE_BULK_ITEM_OPERATION] Success:", data);
    },

    onError: (error: Error) => {
      toast.error("Bulk operation failed", {
        description: error.message,
      });

      console.error("[USE_BULK_ITEM_OPERATION] Error:", error);
    },
  });
}

// ==================== HELPER HOOKS ====================

/**
 * Check if business has any menu items
 */
export function useHasMenuItems(businessId: string) {
  const { data: items } = useMenuItems(businessId);
  return (items?.length || 0) > 0;
}

/**
 * Get count of available items
 */
export function useAvailableItemsCount(businessId: string) {
  const { data: items } = useMenuItems(businessId);
  /* trunk-ignore(eslint/@typescript-eslint/no-explicit-any) */
  return items?.filter((item: any) => item.isAvailable).length || 0;
}

/**
 * Get count of items requiring booking
 */
export function useBookableItemsCount(businessId: string) {
  const { data: items } = useMenuItems(businessId);
  return items?.filter((item: any) => item.requiresBooking).length || 0;
}

/**
 * Get items by type
 */
export function useItemsByType(businessId: string, itemType?: string) {
  const { data: items } = useMenuItems(businessId);

  if (!itemType) return items || [];

  return items?.filter((item: any) => item.itemType === itemType) || [];
}

/**
 * Get items by pricing type
 */
export function useItemsByPricingType(
  businessId: string,
  pricingType?: string
) {
  const { data: items } = useMenuItems(businessId);

  if (!pricingType) return items || [];

  return items?.filter((item: any) => item.pricingType === pricingType) || [];
}

/**
 * Search items by name
 */
export function useSearchItems(businessId: string, searchTerm: string) {
  const { data: items } = useMenuItems(businessId);

  if (!searchTerm) return items || [];

  const lowerSearch = searchTerm.toLowerCase();

  return (
    items?.filter(
      (item: any) =>
        item.name?.toLowerCase().includes(lowerSearch) ||
        item.description?.toLowerCase().includes(lowerSearch) ||
        item.tags?.some((tag: string) =>
          tag.toLowerCase().includes(lowerSearch)
        )
    ) || []
  );
}
