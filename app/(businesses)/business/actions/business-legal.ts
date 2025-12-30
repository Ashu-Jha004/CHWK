/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(businesses)/business/actions/business-legal.ts
"use server";

import { prisma } from "@/lib/prisma";
import { documentSchema } from "@/lib/validations/business-dashboard/legal";
import { revalidatePath } from "next/cache";

/**
 * Uploads a new business document.
 * Includes error handling and path revalidation.
 */
export async function uploadBusinessDocument(
  businessId: string,
  data: unknown
) {
  try {
    // 1. Validate Input using Zod
    const validatedData = documentSchema.parse(data);

    // 2. Perform Database Operation (Corrected to camelCase: businessDocument)
    const document = await prisma.businessDocument.create({
      data: {
        ...validatedData,
        businessId,
        status: "PENDING",
      },
    });

    // 3. Revalidate the specific business dashboard path
    revalidatePath(`/business/dashboard`);

    return { success: true, data: document };
  } catch (error: any) {
    // Detailed error logging for debugging
    console.error(`[LEGAL_UPLOAD_ERROR][Business: ${businessId}]`, error);

    return {
      success: false,
      error:
        error.message || "An unexpected error occurred during document upload.",
    };
  }
}

/**
 * Deletes a business document from the database.
 */
export async function deleteBusinessDocument(id: string) {
  try {
    // Corrected to camelCase: businessDocument
    await prisma.businessDocument.delete({
      where: { id },
    });

    revalidatePath(`/business/dashboard`);
    return { success: true };
  } catch (error: any) {
    console.error(`[LEGAL_DELETE_ERROR][DocID: ${id}]`, error);
    return { success: false, error: "Failed to remove document record." };
  }
}
