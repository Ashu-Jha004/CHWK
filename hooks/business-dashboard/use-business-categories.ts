// hooks/business-dashboard/use-business-categories.ts
"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  updateBusinessCategories,
  updateBusinessAmenities,
} from "@/app/(businesses)/business/actions/update-business-categories";
import { showToast } from "@/lib/business-onboarding/toast";
import { Category, Amenity } from "@prisma/client";

export function useUpdateCategories(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { categoryIds: string[]; primaryCategoryId: string }) =>
      updateBusinessCategories(businessId, data),

    onSuccess: (response) => {
      if (response.success) {
        showToast.success("Categories updated successfully");
        queryClient.invalidateQueries({ queryKey: ["business", businessId] });
      } else {
        showToast.error("Failed to update categories", response.error);
      }
    },

    onError: (error) => {
      console.error("[USE_UPDATE_CATEGORIES] Error:", error);
      showToast.error("Something went wrong", "Unable to update categories");
    },
  });
}

export function useUpdateAmenities(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amenityIds: string[]) =>
      updateBusinessAmenities(businessId, amenityIds),

    onSuccess: (response) => {
      if (response.success) {
        showToast.success("Amenities updated successfully");
        queryClient.invalidateQueries({ queryKey: ["business", businessId] });
      } else {
        showToast.error("Failed to update amenities", response.error);
      }
    },

    onError: (error) => {
      console.error("[USE_UPDATE_AMENITIES] Error:", error);
      showToast.error("Something went wrong", "Unable to update amenities");
    },
  });
}

// Fetch all available categories
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

// Fetch all available amenities
export function useAmenities() {
  return useQuery<Amenity[]>({
    queryKey: ["amenities"],
    queryFn: async () => {
      const response = await fetch("/api/amenities");
      if (!response.ok) throw new Error("Failed to fetch amenities");
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
