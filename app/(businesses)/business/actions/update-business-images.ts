// actions/business/update-business-images.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyBusinessAccess } from "@/lib/auth";
import { deleteCloudinaryImage } from "@/lib/utils/cloudinary-server.utils";
import { ApiResponse } from "@/types/businessDashboard/dashboard-types";

/**
 * Update business logo
 */
export async function updateBusinessLogo(
  businessId: string,
  logoUrl: string,
  publicId: string
): Promise<ApiResponse> {
  try {
    const accessCheck = await verifyBusinessAccess(businessId);

    if (!accessCheck.success) {
      return {
        success: false,
        error: "Access denied",
      };
    }

    // Get old logo to delete
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { logoPublicId: true },
    });

    // Update logo
    await prisma.business.update({
      where: { id: businessId },
      data: {
        logo: logoUrl,
        logoPublicId: publicId,
        updatedAt: new Date(),
      },
    });

    // Delete old logo from Cloudinary
    if (business?.logoPublicId) {
      await deleteCloudinaryImage(business.logoPublicId).catch((err) =>
        console.error("Failed to delete old logo:", err)
      );
    }

    revalidatePath("/business/dashboard");

    return {
      success: true,
      message: "Logo updated successfully",
    };
  } catch (error) {
    console.error("[UPDATE_LOGO] Error:", error);
    return {
      success: false,
      error: "Failed to update logo",
    };
  }
}

/**
 * Update business cover image
 */
export async function updateBusinessCover(
  businessId: string,
  coverUrl: string,
  publicId: string
): Promise<ApiResponse> {
  try {
    const accessCheck = await verifyBusinessAccess(businessId);

    if (!accessCheck.success) {
      return {
        success: false,
        error: "Access denied",
      };
    }

    // Get old cover to delete
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { coverImagePublicId: true },
    });

    // Update cover
    await prisma.business.update({
      where: { id: businessId },
      data: {
        coverImage: coverUrl,
        coverImagePublicId: publicId,
        updatedAt: new Date(),
      },
    });

    // Delete old cover from Cloudinary
    if (business?.coverImagePublicId) {
      await deleteCloudinaryImage(business.coverImagePublicId).catch((err) =>
        console.error("Failed to delete old cover:", err)
      );
    }

    revalidatePath("/business/dashboard");

    return {
      success: true,
      message: "Cover image updated successfully",
    };
  } catch (error) {
    console.error("[UPDATE_COVER] Error:", error);
    return {
      success: false,
      error: "Failed to update cover image",
    };
  }
}

/**
 * Add image to gallery
 */
export async function addGalleryImage(
  businessId: string,
  imageUrl: string,
  publicId: string
): Promise<ApiResponse> {
  try {
    const accessCheck = await verifyBusinessAccess(businessId);

    if (!accessCheck.success) {
      return {
        success: false,
        error: "Access denied",
      };
    }

    // Get current gallery count for ordering
    const count = await prisma.businessImage.count({
      where: { businessId },
    });

    // Add image
    await prisma.businessImage.create({
      data: {
        businessId,
        imageUrl,
        publicId,
        displayOrder: count,
      },
    });

    revalidatePath("/business/dashboard");

    return {
      success: true,
      message: "Image added to gallery",
    };
  } catch (error) {
    console.error("[ADD_GALLERY_IMAGE] Error:", error);
    return {
      success: false,
      error: "Failed to add image",
    };
  }
}

/**
 * Delete gallery image
 */
export async function deleteGalleryImage(
  businessId: string,
  imageId: string
): Promise<ApiResponse> {
  try {
    const accessCheck = await verifyBusinessAccess(businessId);

    if (!accessCheck.success) {
      return {
        success: false,
        error: "Access denied",
      };
    }

    // Get image
    const image = await prisma.businessImage.findUnique({
      where: { id: imageId },
      select: { publicId: true, businessId: true },
    });

    if (!image || image.businessId !== businessId) {
      return {
        success: false,
        error: "Image not found",
      };
    }

    // Delete from database
    await prisma.businessImage.delete({
      where: { id: imageId },
    });

    // Delete from Cloudinary
    if (image.publicId) {
      await deleteCloudinaryImage(image.publicId).catch((err) =>
        console.error("Failed to delete from Cloudinary:", err)
      );
    }

    revalidatePath("/business/dashboard");

    return {
      success: true,
      message: "Image deleted successfully",
    };
  } catch (error) {
    console.error("[DELETE_GALLERY_IMAGE] Error:", error);
    return {
      success: false,
      error: "Failed to delete image",
    };
  }
}

/**
 * Reorder gallery images
 */
export async function reorderGalleryImages(
  businessId: string,
  imageOrders: { id: string; order: number }[]
): Promise<ApiResponse> {
  try {
    const accessCheck = await verifyBusinessAccess(businessId);

    if (!accessCheck.success) {
      return {
        success: false,
        error: "Access denied",
      };
    }

    // Update orders in transaction
    await prisma.$transaction(
      imageOrders.map((item) =>
        prisma.businessImage.update({
          where: { id: item.id, businessId },
          data: { displayOrder: item.order },
        })
      )
    );

    revalidatePath("/business/dashboard");

    return {
      success: true,
      message: "Gallery reordered successfully",
    };
  } catch (error) {
    console.error("[REORDER_GALLERY] Error:", error);
    return {
      success: false,
      error: "Failed to reorder images",
    };
  }
}
