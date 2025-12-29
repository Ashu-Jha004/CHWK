// hooks/business-dashboard/use-business-images.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateBusinessLogo,
  updateBusinessCover,
  addGalleryImage,
  deleteGalleryImage,
  reorderGalleryImages,
} from "@/app/(businesses)/business/actions/update-business-images";
import { showToast } from "@/lib/business-onboarding/toast";

export function useUpdateLogo(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      logoUrl,
      publicId,
    }: {
      logoUrl: string;
      publicId: string;
    }) => updateBusinessLogo(businessId, logoUrl, publicId),

    onSuccess: (response) => {
      if (response.success) {
        showToast.success("Logo updated successfully");
        queryClient.invalidateQueries({ queryKey: ["business", businessId] });
      } else {
        showToast.error("Failed to update logo", response.error);
      }
    },

    onError: (error) => {
      console.error("[USE_UPDATE_LOGO] Error:", error);
      showToast.error("Something went wrong", "Unable to update logo");
    },
  });
}

export function useUpdateCover(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      coverUrl,
      publicId,
    }: {
      coverUrl: string;
      publicId: string;
    }) => updateBusinessCover(businessId, coverUrl, publicId),

    onSuccess: (response) => {
      if (response.success) {
        showToast.success("Cover image updated successfully");
        queryClient.invalidateQueries({ queryKey: ["business", businessId] });
      } else {
        showToast.error("Failed to update cover", response.error);
      }
    },

    onError: (error) => {
      console.error("[USE_UPDATE_COVER] Error:", error);
      showToast.error("Something went wrong", "Unable to update cover image");
    },
  });
}

export function useAddGalleryImage(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      imageUrl,
      publicId,
    }: {
      imageUrl: string;
      publicId: string;
    }) => addGalleryImage(businessId, imageUrl, publicId),

    onSuccess: (response) => {
      if (response.success) {
        showToast.success("Image added to gallery");
        queryClient.invalidateQueries({ queryKey: ["business", businessId] });
      } else {
        showToast.error("Failed to add image", response.error);
      }
    },

    onError: (error) => {
      console.error("[USE_ADD_GALLERY_IMAGE] Error:", error);
      showToast.error("Something went wrong", "Unable to add image");
    },
  });
}

export function useDeleteGalleryImage(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => deleteGalleryImage(businessId, imageId),

    onSuccess: (response) => {
      if (response.success) {
        showToast.success("Image deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["business", businessId] });
      } else {
        showToast.error("Failed to delete image", response.error);
      }
    },

    onError: (error) => {
      console.error("[USE_DELETE_GALLERY_IMAGE] Error:", error);
      showToast.error("Something went wrong", "Unable to delete image");
    },
  });
}

export function useReorderGallery(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageOrders: { id: string; order: number }[]) =>
      reorderGalleryImages(businessId, imageOrders),

    onSuccess: (response) => {
      if (response.success) {
        showToast.success("Gallery reordered successfully");
        queryClient.invalidateQueries({ queryKey: ["business", businessId] });
      } else {
        showToast.error("Failed to reorder gallery", response.error);
      }
    },

    onError: (error) => {
      console.error("[USE_REORDER_GALLERY] Error:", error);
      showToast.error("Something went wrong", "Unable to reorder images");
    },
  });
}
