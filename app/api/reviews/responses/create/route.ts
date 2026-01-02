// app/api/reviews/responses/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createResponseSchema } from "@/lib/validations/review/review";

/**
 * POST /api/reviews/responses/create
 * Creates a response to a review (business owner only)
 */
export async function POST(request: NextRequest) {
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
    const validation = createResponseSchema.safeParse(body);

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
    // 4. FETCH REVIEW AND VERIFY OWNERSHIP
    // ============================================
    const review = await prisma.review.findUnique({
      where: { id: data.reviewId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        response: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found", message: "The review does not exist" },
        { status: 404 }
      );
    }

    // Check if user is the business owner
    if (review.business.ownerId !== dbUser.id) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Only the business owner can respond to reviews",
        },
        { status: 403 }
      );
    }

    // ============================================
    // 5. CHECK IF RESPONSE ALREADY EXISTS
    // ============================================
    if (review.response) {
      return NextResponse.json(
        {
          error: "Response exists",
          message: "You have already responded to this review. You can edit your existing response.",
        },
        { status: 409 }
      );
    }

    // ============================================
    // 6. CREATE RESPONSE (with 7-day edit window)
    // ============================================
    const editableUntil = new Date();
    editableUntil.setDate(editableUntil.getDate() + 7); // 7-day edit window

    const response = await prisma.reviewResponse.create({
      data: {
        reviewId: data.reviewId,
        userId: dbUser.id,
        content: data.content,
        editableUntil,
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
        message: "Response posted successfully",
        response: {
          id: response.id,
          content: response.content,
          editableUntil: response.editableUntil,
          createdAt: response.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Review Response Create] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to post response. Please try again later.",
      },
      { status: 500 }
    );
  }
}
