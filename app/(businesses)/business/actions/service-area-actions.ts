/* eslint-disable @typescript-eslint/no-explicit-any */
// app/business/actions/service-area-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyBusinessAccess } from "@/lib/auth";
import {
  serviceAreaSchema,
  bulkServiceAreaSchema,
  type ServiceAreaFormData,
  type BulkServiceAreaData,
} from "@/lib/validations/business-dashboard/profile/service-area";

// ==================== TYPES ====================

interface ServiceAreaResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// ==================== ADD SERVICE AREA ====================

export async function addServiceArea(
  businessId: string,
  data: ServiceAreaFormData
): Promise<ServiceAreaResponse> {
  try {
    console.log("[ADD_SERVICE_AREA] Starting for business:", businessId);
    console.log("[ADD_SERVICE_AREA] Data:", JSON.stringify(data, null, 2));

    // 1. Verify access
    const accessCheck = await verifyBusinessAccess(businessId);
    if (!accessCheck.success) {
      console.error("[ADD_SERVICE_AREA] Access denied:", accessCheck.error);
      return {
        success: false,
        error: accessCheck.error || "Access denied",
      };
    }

    // 2. Validate data
    const validationResult = serviceAreaSchema.safeParse(data);
    if (!validationResult.success) {
      console.error(
        "[ADD_SERVICE_AREA] Validation failed:",
        validationResult.error.flatten()
      );
      return {
        success: false,
        error: "Invalid data provided",
        message:
          validationResult.error.issues[0]?.message || "Validation failed",
      };
    }

    const validatedData = validationResult.data;

    // 3. Check for duplicate pincode (if provided)
    if (validatedData.pincode) {
      const existingArea = await prisma.serviceArea.findFirst({
        where: {
          businessId,
          pincode: validatedData.pincode,
          isActive: true,
        },
      });

      if (existingArea) {
        console.error("[ADD_SERVICE_AREA] Duplicate pincode found");
        return {
          success: false,
          error: "This pincode is already added to your service areas",
        };
      }
    }

    // 4. Create service area
    const serviceArea = await prisma.serviceArea.create({
      data: {
        businessId,
        areaName: validatedData.areaName,
        pincode: validatedData.pincode,
        city: validatedData.city,
        deliveryFee: validatedData.deliveryFee,
        minimumOrder: validatedData.minimumOrder,
        estimatedTime: validatedData.estimatedTime,
        isActive: validatedData.isActive,
      },
    });

    console.log("[ADD_SERVICE_AREA] Service area created:", serviceArea.id);

    // 5. Revalidate cache
    revalidatePath("/business/dashboard");
    revalidatePath(`/business/${businessId}`);

    return {
      success: true,
      message: "Service area added successfully",
      data: serviceArea,
    };
  } catch (error) {
    console.error("[ADD_SERVICE_AREA] Error:", error);
    return {
      success: false,
      error: "Failed to add service area. Please try again.",
    };
  }
}

// ==================== UPDATE SERVICE AREA ====================

export async function updateServiceArea(
  areaId: string,
  data: ServiceAreaFormData
): Promise<ServiceAreaResponse> {
  try {
    console.log("[UPDATE_SERVICE_AREA] Updating area:", areaId);
    console.log("[UPDATE_SERVICE_AREA] Data:", JSON.stringify(data, null, 2));

    // 1. Get existing area to verify business ownership
    const existingArea = await prisma.serviceArea.findUnique({
      where: { id: areaId },
      select: { businessId: true },
    });

    if (!existingArea) {
      console.error("[UPDATE_SERVICE_AREA] Area not found");
      return {
        success: false,
        error: "Service area not found",
      };
    }

    // 2. Verify access
    const accessCheck = await verifyBusinessAccess(existingArea.businessId);
    if (!accessCheck.success) {
      console.error("[UPDATE_SERVICE_AREA] Access denied:", accessCheck.error);
      return {
        success: false,
        error: accessCheck.error || "Access denied",
      };
    }

    // 3. Validate data
    const validationResult = serviceAreaSchema.safeParse(data);
    if (!validationResult.success) {
      console.error(
        "[UPDATE_SERVICE_AREA] Validation failed:",
        validationResult.error.flatten()
      );
      return {
        success: false,
        error: "Invalid data provided",
        message:
          validationResult.error.issues[0]?.message || "Validation failed",
      };
    }

    const validatedData = validationResult.data;

    // 4. Check for duplicate pincode (excluding current area)
    if (validatedData.pincode) {
      const duplicateArea = await prisma.serviceArea.findFirst({
        where: {
          businessId: existingArea.businessId,
          pincode: validatedData.pincode,
          isActive: true,
          id: { not: areaId },
        },
      });

      if (duplicateArea) {
        console.error("[UPDATE_SERVICE_AREA] Duplicate pincode found");
        return {
          success: false,
          error: "This pincode is already added to your service areas",
        };
      }
    }

    // 5. Update service area
    const updatedArea = await prisma.serviceArea.update({
      where: { id: areaId },
      data: {
        areaName: validatedData.areaName,
        pincode: validatedData.pincode,
        city: validatedData.city,
        deliveryFee: validatedData.deliveryFee,
        minimumOrder: validatedData.minimumOrder,
        estimatedTime: validatedData.estimatedTime,
        isActive: validatedData.isActive,
        updatedAt: new Date(),
      },
    });

    console.log("[UPDATE_SERVICE_AREA] Area updated successfully");

    // 6. Revalidate cache
    revalidatePath("/business/dashboard");
    revalidatePath(`/business/${existingArea.businessId}`);

    return {
      success: true,
      message: "Service area updated successfully",
      data: updatedArea,
    };
  } catch (error) {
    console.error("[UPDATE_SERVICE_AREA] Error:", error);
    return {
      success: false,
      error: "Failed to update service area. Please try again.",
    };
  }
}

// ==================== DELETE SERVICE AREA ====================

export async function deleteServiceArea(
  areaId: string
): Promise<ServiceAreaResponse> {
  try {
    console.log("[DELETE_SERVICE_AREA] Deleting area:", areaId);

    // 1. Get existing area to verify business ownership
    const existingArea = await prisma.serviceArea.findUnique({
      where: { id: areaId },
      select: { businessId: true },
    });

    if (!existingArea) {
      console.error("[DELETE_SERVICE_AREA] Area not found");
      return {
        success: false,
        error: "Service area not found",
      };
    }

    // 2. Verify access
    const accessCheck = await verifyBusinessAccess(existingArea.businessId);
    if (!accessCheck.success) {
      console.error("[DELETE_SERVICE_AREA] Access denied:", accessCheck.error);
      return {
        success: false,
        error: accessCheck.error || "Access denied",
      };
    }

    // 3. Delete service area
    await prisma.serviceArea.delete({
      where: { id: areaId },
    });

    console.log("[DELETE_SERVICE_AREA] Area deleted successfully");

    // 4. Revalidate cache
    revalidatePath("/business/dashboard");
    revalidatePath(`/business/${existingArea.businessId}`);

    return {
      success: true,
      message: "Service area deleted successfully",
    };
  } catch (error) {
    console.error("[DELETE_SERVICE_AREA] Error:", error);
    return {
      success: false,
      error: "Failed to delete service area. Please try again.",
    };
  }
}

// ==================== GET SERVICE AREAS ====================

export async function getServiceAreas(
  businessId: string
): Promise<ServiceAreaResponse> {
  try {
    console.log("[GET_SERVICE_AREAS] Fetching areas for business:", businessId);

    // 1. Verify access
    const accessCheck = await verifyBusinessAccess(businessId);
    if (!accessCheck.success) {
      console.error("[GET_SERVICE_AREAS] Access denied:", accessCheck.error);
      return {
        success: false,
        error: accessCheck.error || "Access denied",
      };
    }

    // 2. Fetch service areas
    const areas = await prisma.serviceArea.findMany({
      where: { businessId },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });

    console.log("[GET_SERVICE_AREAS] Found areas:", areas.length);

    return {
      success: true,
      data: areas,
    };
  } catch (error) {
    console.error("[GET_SERVICE_AREAS] Error:", error);
    return {
      success: false,
      error: "Failed to fetch service areas",
    };
  }
}

// ==================== BULK OPERATIONS ====================

export async function bulkServiceAreaOperation(
  businessId: string,
  operationData: BulkServiceAreaData
): Promise<ServiceAreaResponse> {
  try {
    console.log(
      "[BULK_SERVICE_AREA] Starting operation:",
      operationData.action
    );
    console.log("[BULK_SERVICE_AREA] Area IDs:", operationData.areaIds);

    // 1. Verify access
    const accessCheck = await verifyBusinessAccess(businessId);
    if (!accessCheck.success) {
      console.error("[BULK_SERVICE_AREA] Access denied:", accessCheck.error);
      return {
        success: false,
        error: accessCheck.error || "Access denied",
      };
    }

    // 2. Validate data
    const validationResult = bulkServiceAreaSchema.safeParse(operationData);
    if (!validationResult.success) {
      console.error(
        "[BULK_SERVICE_AREA] Validation failed:",
        validationResult.error.flatten()
      );
      return {
        success: false,
        error: "Invalid data provided",
        message:
          validationResult.error.issues[0]?.message || "Validation failed",
      };
    }

    const { areaIds, action } = validationResult.data;

    // 3. Perform bulk operation
    let result;
    switch (action) {
      case "enable":
        result = await prisma.serviceArea.updateMany({
          where: {
            id: { in: areaIds },
            businessId,
          },
          data: {
            isActive: true,
            updatedAt: new Date(),
          },
        });
        break;

      case "disable":
        result = await prisma.serviceArea.updateMany({
          where: {
            id: { in: areaIds },
            businessId,
          },
          data: {
            isActive: false,
            updatedAt: new Date(),
          },
        });
        break;

      case "delete":
        result = await prisma.serviceArea.deleteMany({
          where: {
            id: { in: areaIds },
            businessId,
          },
        });
        break;

      default:
        return {
          success: false,
          error: "Invalid action",
        };
    }

    console.log(
      "[BULK_SERVICE_AREA] Operation completed. Affected:",
      result.count
    );

    // 4. Revalidate cache
    revalidatePath("/business/dashboard");
    revalidatePath(`/business/${businessId}`);

    return {
      success: true,
      message: `Successfully ${action}d ${result.count} service area(s)`,
      data: { affected: result.count },
    };
  } catch (error) {
    console.error("[BULK_SERVICE_AREA] Error:", error);
    return {
      success: false,
      error: "Bulk operation failed. Please try again.",
    };
  }
}
