// app/api/reviews/responses/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { updateResponseSchema } from "@/lib/validations/review/review";
import { canEditReview } from "@/lib/utils/review-utils";

/**
 * PATCH /api/reviews/responses/update
 * Updates a review response (within 7-day window)
 */
export async function PATCH(request: NextRequest) {
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
    const validation = updateResponseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Invalid response data",
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
        { error: "Forbidden", message: "You can only edit your own responses" },
        { status: 403 }
      );
    }

    // Check if deleted
    if (existingResponse.deletedAt) {
      return NextResponse.json(
        { error: "Response deleted", message: "Cannot edit a deleted response" },
        { status: 410 }
      );
    }

    // ============================================
    // 5. CHECK EDIT PERMISSION (7-day window)
    // ============================================
    const editPermission = canEditReview(existingResponse.editableUntil);

    if (!editPermission.canEdit) {
      return NextResponse.json(
        {
          error: "Edit window expired",
          message: editPermission.reason || "You can no longer edit this response",
        },
        { status: 403 }
      );
    }

    // ============================================
    // 6. UPDATE RESPONSE
    // ============================================
    const updatedResponse = await prisma.reviewResponse.update({
      where: { id: data.responseId },
      data: {
        content: data.content,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // ============================================
    // 7. RETURN SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        success: true,
        message: "Response updated successfully",
        response: {
          id: updatedResponse.id,
          content: updatedResponse.content,
          isEdited: updatedResponse.isEdited,
          editedAt: updatedResponse.editedAt,
          editableUntil: updatedResponse.editableUntil,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Review Response Update] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update response. Please try again later.",
      },
      { status: 500 }
    );
  }
}
