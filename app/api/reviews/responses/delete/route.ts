// app/api/reviews/responses/delete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { deleteResponseSchema } from "@/lib/validations/review/review";
import { canEditReview } from "@/lib/utils/review-utils";

/**
 * DELETE /api/reviews/responses/delete
 * Soft deletes a review response (within 7-day window)
 */
export async function DELETE(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTHENTICATION CHECK
    // ============================================
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be signed in" },
        { status: 401 }
      );
    }

    // ============================================
    // 2. PARSE AND VALIDATE REQUEST BODY
    // ============================================
    const body = await request.json();
    const validation = deleteResponseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Invalid request data",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // ============================================
    // 3. GET USER FROM DATABASE
    // ============================================
    const dbUser = await prisma.user.findUnique({
      where: { email: user.emailAddresses[0].emailAddress },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found", message: "User account not found" },
        { status: 404 }
      );
    }

    // ============================================
    // 4. FETCH RESPONSE AND VERIFY OWNERSHIP
    // ============================================
    const existingResponse = await prisma.reviewResponse.findUnique({
      where: { id: data.responseId },
      select: {
        id: true,
        userId: true,
        editableUntil: true,
        deletedAt: true,
      },
    });

    if (!existingResponse) {
      return NextResponse.json(
        { error: "Response not found", message: "The response does not exist" },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingResponse.userId !== dbUser.id) {
      return NextResponse.json(
        { error: "Forbidden", message: "You can only delete your own responses" },
        { status: 403 }
      );
    }

    // Check if already deleted
    if (existingResponse.deletedAt) {
      return NextResponse.json(
        { error: "Already deleted", message: "This response has already been deleted" },
        { status: 410 }
      );
    }

    // ============================================
    // 5. CHECK DELETE PERMISSION (7-day window)
    // ============================================
    const editPermission = canEditReview(existingResponse.editableUntil);

    if (!editPermission.canEdit) {
      return NextResponse.json(
        {
          error: "Delete window expired",
          message: "You can no longer delete this response (7-day window expired)",
        },
        { status: 403 }
      );
    }

    // ============================================
    // 6. SOFT DELETE RESPONSE
    // ============================================
    await prisma.reviewResponse.update({
      where: { id: data.responseId },
      data: {
        deletedAt: new Date(),
      },
    });

    // ============================================
    // 7. RETURN SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        success: true,
        message: "Response deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Review Response Delete] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to delete response. Please try again later.",
      },
      { status: 500 }
    );
  }
}
