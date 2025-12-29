/* eslint-disable @typescript-eslint/no-explicit-any */
// actions/business/upload-signature.ts
"use server";

import {
  generateUploadSignature,
  CLOUDINARY_FOLDERS,
} from "@/lib/utils/cloudinary-server.utils";
import { verifyBusinessAccess } from "@/lib/auth";
import { ApiResponse } from "@/types/businessDashboard/dashboard-types";

export async function getUploadSignature(
  businessId: string,
  folder: keyof typeof CLOUDINARY_FOLDERS
): Promise<ApiResponse<any>> {
  try {
    // Verify business access
    const accessCheck = await verifyBusinessAccess(businessId);

    if (!accessCheck.success) {
      return {
        success: false,
        error: "Access denied",
      };
    }

    // Generate signature
    const signature = await generateUploadSignature(CLOUDINARY_FOLDERS[folder]);

    return {
      success: true,
      data: signature,
    };
  } catch (error) {
    console.error("[UPLOAD_SIGNATURE] Error:", error);
    return {
      success: false,
      error: "Failed to generate upload signature",
    };
  }
}
