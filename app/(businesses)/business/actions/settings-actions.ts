"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const formSettingsSchema = z.object({
  formUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  formResponseUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export async function updateBusinessForms(
  businessId: string,
  formUrl: string,
  formResponseUrl: string
) {
  try {
    const validatedFields = formSettingsSchema.safeParse({
      formUrl,
      formResponseUrl,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.issues[0].message,
      };
    }

    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        form: formUrl,
        formResponse: formResponseUrl,
      },
    });

    revalidatePath(`/business/${businessId}`);
    revalidatePath(`/dashboard/business/overview`);

    return { success: true, data: updatedBusiness };
  } catch (error: any) {
    console.error("Failed to update business forms:", error);
    return {
      success: false,
      error: "Failed to update settings",
    };
  }
}
