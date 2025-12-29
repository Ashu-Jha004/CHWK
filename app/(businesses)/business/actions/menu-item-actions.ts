/* eslint-disable @typescript-eslint/no-explicit-any */
// app/business/actions/menu-item-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyBusinessAccess } from "@/lib/auth";
import {
  menuItemSchema,
  bulkItemOperationSchema,
  type MenuItemFormData,
  type BulkItemOperationData,
} from "@/lib/validations/business-dashboard/profile/menu-item";

// ==================== GET MENU ITEMS ====================

export async function getMenuItems(businessId: string): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    console.log("[GET_MENU_ITEMS] Fetching items for business:", businessId);

    const accessCheck = await verifyBusinessAccess(businessId);
    if (!accessCheck.success) {
      console.error("[GET_MENU_ITEMS] Access denied:", accessCheck.error);
      return {
        success: false,
        error: accessCheck.error || "Access denied",
      };
    }

    const items = await prisma.menuItem.findMany({
      where: {
        businessId,
        deletedAt: null,
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        businessId: true,
        name: true,
        description: true,
        itemType: true,
        deliveryType: true,
        pricingType: true,
        price: true,
        discountedPrice: true,
        hourlyRate: true,
        dailyRate: true,
        priceNote: true,
        serviceDuration: true,
        requiresBooking: true,
        bufferTime: true,
        isAvailable: true,
        availableDays: true,
        availableOnline: true,
        availableAtLocation: true,
        availableOnSite: true,
        maxTravelDistance: true,
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        isJain: true,
        spiceLevel: true,
        duration: true,
        requiresStaff: true,
        hasLimitedStock: true,
        stockQuantity: true,
        tags: true,
        displayOrder: true,
        isFeatured: true,
        isBestseller: true,
        totalOrders: true,
        averageRating: true,
        image: true,
        images: true,
        category: true,
        subcategory: true,
        customizationOptions: true,
        calories: true,
        servingSize: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`[GET_MENU_ITEMS] Found ${items.length} items`);

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("[GET_MENU_ITEMS] Error:", error);
    return {
      success: false,
      error: "Failed to fetch menu items",
    };
  }
}

// ==================== TYPES ====================

interface MenuItemResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// ==================== HELPERS ====================

const prepareDataForPrisma = (data: any) => {
  const cleaned: any = { ...data };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === null) {
      cleaned[key] = undefined;
    }
  });
  return cleaned;
};

// ==================== CREATE MENU ITEM ====================

export async function createMenuItem(
  businessId: string,
  data: MenuItemFormData
): Promise<MenuItemResponse> {
  try {
    console.log("[CREATE_MENU_ITEM] Starting for business:", businessId);
    console.log("[CREATE_MENU_ITEM] Data:", JSON.stringify(data, null, 2));

    const accessCheck = await verifyBusinessAccess(businessId);
    if (!accessCheck.success) {
      console.error("[CREATE_MENU_ITEM] Access denied:", accessCheck.error);
      return {
        success: false,
        error: accessCheck.error || "Access denied",
      };
    }

    const validationResult = menuItemSchema.safeParse(data);
    if (!validationResult.success) {
      console.error(
        "[CREATE_MENU_ITEM] Validation failed:",
        validationResult.error.flatten()
      );
      return {
        success: false,
        error: "Invalid data provided",
        message:
          validationResult.error.issues[0]?.message || "Validation failed",
      };
    }

    const validatedData = prepareDataForPrisma(validationResult.data);

    // Map ONLY to actual database fields from your schema
    const dbData: any = {
      businessId, // Required field
      name: validatedData.name,
      description: validatedData.description,
      price: validatedData.basePrice || 0, // basePrice → price
      discountedPrice: validatedData.salePrice, // salePrice → discountedPrice
      image: validatedData.image,
      // images: [], // Optional - can add later
      category:
        validatedData.categoryId &&
        validatedData.categoryId !== "temp-category-id"
          ? validatedData.categoryId
          : undefined,
      subcategory: undefined, // Not in form
      isVegetarian: validatedData.isVeg || false,
      isVegan: validatedData.isVegan || false,
      isGlutenFree: validatedData.isGlutenFree || false,
      isJain: false, // Not in form
      spiceLevel: validatedData.spicyLevel
        ? String(validatedData.spicyLevel)
        : undefined,
      duration: validatedData.serviceDuration, // serviceDuration → duration
      requiresStaff: false, // Not in form
      isAvailable: validatedData.isAvailable !== false,
      availableFrom: undefined, // Not in form
      availableTo: undefined, // Not in form
      hasLimitedStock:
        validatedData.stockQuantity !== null &&
        validatedData.stockQuantity !== undefined,
      stockQuantity: validatedData.stockQuantity,
      tags: [], // Not in form (allergens/tags filtered out)
      displayOrder: validatedData.displayOrder || 0,
      isFeatured: validatedData.isFeatured || false,
      isBestseller: validatedData.isRecommended || false,
      calories: undefined, // Not in form
      servingSize: undefined, // Not in form
      customizationOptions: undefined, // Not in form
      totalOrders: 0, // Default
      averageRating: undefined, // Default null
      // NEW UNIVERSAL FIELDS
      itemType: validatedData.itemType,
      deliveryType: validatedData.deliveryType,
      pricingType: validatedData.pricingType,
      hourlyRate: validatedData.hourlyRate,
      dailyRate: validatedData.dailyRate,
      priceNote: validatedData.priceNote,
      serviceDuration: validatedData.serviceDuration,
      requiresBooking: validatedData.requiresBooking || false,
      bufferTime: validatedData.bufferTime,
      availableDays: validatedData.availableDays || [],
      availableOnline: validatedData.availableOnline || false,
      availableAtLocation: validatedData.availableAtLocation || false,
      availableOnSite: validatedData.availableOnSite || false,
      maxTravelDistance: validatedData.maxTravelDistance,
      skillLevel: validatedData.skillLevel,
      certification: validatedData.certification,
      cancellationPolicy: validatedData.cancellationPolicy,
      // slug: undefined, // Not in your schema
    };

    // Remove undefined values
    Object.keys(dbData).forEach((key) => {
      if (dbData[key] === undefined) {
        delete dbData[key];
      }
    });

    console.log(
      "[CREATE_MENU_ITEM] Final dbData:",
      JSON.stringify(dbData, null, 2)
    );

    // Create menu item
    const menuItem = await prisma.menuItem.create({
      data: dbData,
    });

    console.log("[CREATE_MENU_ITEM] Item created:", menuItem.id);

    revalidatePath("/business/dashboard");
    revalidatePath(`/business/${businessId}`);

    return {
      success: true,
      message: "Item created successfully",
      data: menuItem,
    };
  } catch (error) {
    console.error("[CREATE_MENU_ITEM] Error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Foreign key constraint")
    ) {
      return { success: false, error: "Invalid category selected" };
    }

    return {
      success: false,
      error: "Failed to create item. Please try again.",
    };
  }
}

// ==================== UPDATE MENU ITEM ====================

export async function updateMenuItem(
  itemId: string,
  data: MenuItemFormData
): Promise<MenuItemResponse> {
  try {
    console.log("[UPDATE_MENU_ITEM] Updating item:", itemId);

    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { businessId: true },
    });

    if (!existingItem) {
      return { success: false, error: "Item not found" };
    }

    const accessCheck = await verifyBusinessAccess(existingItem.businessId);
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error || "Access denied" };
    }

    const validationResult = menuItemSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid data provided",
        message:
          validationResult.error.issues[0]?.message || "Validation failed",
      };
    }

    const validatedData = prepareDataForPrisma(validationResult.data);

    const dbData: any = {
      name: validatedData.name,
      description: validatedData.description,
      price: validatedData.basePrice || 0,
      discountedPrice: validatedData.salePrice,
      image: validatedData.image,
      category:
        validatedData.categoryId &&
        validatedData.categoryId !== "temp-category-id"
          ? validatedData.categoryId
          : undefined,
      isVegetarian: validatedData.isVeg || false,
      isVegan: validatedData.isVegan || false,
      isGlutenFree: validatedData.isGlutenFree || false,
      spiceLevel: validatedData.spicyLevel
        ? String(validatedData.spicyLevel)
        : undefined,
      duration: validatedData.serviceDuration,
      isAvailable: validatedData.isAvailable !== false,
      hasLimitedStock:
        validatedData.stockQuantity !== null &&
        validatedData.stockQuantity !== undefined,
      stockQuantity: validatedData.stockQuantity,
      displayOrder: validatedData.displayOrder || 0,
      isFeatured: validatedData.isFeatured || false,
      isBestseller: validatedData.isRecommended || false,
      itemType: validatedData.itemType,
      deliveryType: validatedData.deliveryType,
      pricingType: validatedData.pricingType,
      hourlyRate: validatedData.hourlyRate,
      dailyRate: validatedData.dailyRate,
      priceNote: validatedData.priceNote,
      serviceDuration: validatedData.serviceDuration,
      requiresBooking: validatedData.requiresBooking || false,
      bufferTime: validatedData.bufferTime,
      availableDays: validatedData.availableDays || [],
      availableOnline: validatedData.availableOnline || false,
      availableAtLocation: validatedData.availableAtLocation || false,
      availableOnSite: validatedData.availableOnSite || false,
      maxTravelDistance: validatedData.maxTravelDistance,
      skillLevel: validatedData.skillLevel,
      certification: validatedData.certification,
      cancellationPolicy: validatedData.cancellationPolicy,
      updatedAt: new Date(),
    };

    Object.keys(dbData).forEach((key) => {
      if (dbData[key] === undefined) {
        delete dbData[key];
      }
    });

    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: dbData,
    });

    revalidatePath("/business/dashboard");
    revalidatePath(`/business/${existingItem.businessId}`);

    return {
      success: true,
      message: "Item updated successfully",
      data: updatedItem,
    };
  } catch (error) {
    console.error("[UPDATE_MENU_ITEM] Error:", error);
    return { success: false, error: "Failed to update item." };
  }
}

// ==================== DELETE MENU ITEM ====================

export async function deleteMenuItem(
  itemId: string
): Promise<MenuItemResponse> {
  try {
    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { businessId: true },
    });

    if (!existingItem) return { success: false, error: "Item not found" };

    const accessCheck = await verifyBusinessAccess(existingItem.businessId);
    if (!accessCheck.success) return { success: false, error: "Access denied" };

    await prisma.menuItem.update({
      where: { id: itemId },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/business/dashboard");
    return { success: true, message: "Item deleted successfully" };
  } catch (error) {
    console.error("[DELETE_MENU_ITEM] Error:", error);
    return { success: false, error: "Failed to delete item." };
  }
}

// ==================== TOGGLE AVAILABILITY ====================

export async function toggleItemAvailability(
  itemId: string
): Promise<MenuItemResponse> {
  try {
    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { businessId: true, isAvailable: true },
    });

    if (!existingItem) return { success: false, error: "Item not found" };

    const accessCheck = await verifyBusinessAccess(existingItem.businessId);
    if (!accessCheck.success) return { success: false, error: "Access denied" };

    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        isAvailable: !existingItem.isAvailable,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/business/dashboard");
    return { success: true, message: "Status updated", data: updatedItem };
  } catch (error) {
    console.error("[TOGGLE_AVAILABILITY] Error:", error);
    return { success: false, error: "Failed to toggle status" };
  }
}

// ==================== BULK OPERATIONS ====================

export async function bulkItemOperation(
  businessId: string,
  operationData: BulkItemOperationData
): Promise<MenuItemResponse> {
  try {
    const accessCheck = await verifyBusinessAccess(businessId);
    if (!accessCheck.success) return { success: false, error: "Access denied" };

    const validationResult = bulkItemOperationSchema.safeParse(operationData);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid data",
        message: validationResult.error.issues[0]?.message,
      };
    }

    const { itemIds, action, targetCategoryId } = validationResult.data;

    let result;
    switch (action) {
      case "enable":
        result = await prisma.menuItem.updateMany({
          where: { id: { in: itemIds }, businessId },
          data: { isAvailable: true, updatedAt: new Date() },
        });
        break;
      case "disable":
        result = await prisma.menuItem.updateMany({
          where: { id: { in: itemIds }, businessId },
          data: { isAvailable: false, updatedAt: new Date() },
        });
        break;
      case "delete":
        result = await prisma.menuItem.updateMany({
          where: { id: { in: itemIds }, businessId },
          data: { deletedAt: new Date() },
        });
        break;
      case "change-category":
        if (!targetCategoryId)
          return { success: false, error: "Target category required" };
        result = await prisma.menuItem.updateMany({
          where: { id: { in: itemIds }, businessId },
          data: { category: targetCategoryId, updatedAt: new Date() },
        });
        break;
      default:
        return { success: false, error: "Invalid action" };
    }

    revalidatePath("/business/dashboard");
    return {
      success: true,
      message: `Successfully ${action}d items`,
      data: { affected: result.count },
    };
  } catch (error) {
    console.error("[BULK_ITEM_OPERATION] Error:", error);
    return { success: false, error: "Bulk operation failed." };
  }
}
