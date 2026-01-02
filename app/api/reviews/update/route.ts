// app/api/reviews/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { updateReviewSchema } from "@/lib/validations/review/review";
import { verifyTurnstileToken } from "@/lib/services/turnstile";
import { canEditReview } from "@/lib/utils/review-utils";

/**
 * PATCH /api/reviews/update
 * Updates an existing review (within 24-hour window)
 */
export async function PATCH(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTHENTICATION CHECK
    // ============================================
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be signed in to update a review" },
        { status: 401 }
      );
    }

    // ============================================
    // 2. PARSE AND VALIDATE REQUEST BODY
    // ============================================
    const body = await request.json();
    const validation = updateReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Invalid review data",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // ============================================
    // 3. CLOUDFLARE TURNSTILE VERIFICATION
    // ============================================
    const captchaResult = await verifyTurnstileToken(
      data.captchaToken,
      request.headers.get("x-forwarded-for") || undefined
    );

    if (!captchaResult.success) {
      return NextResponse.json(
        {
          error: "CAPTCHA failed",
          message: captchaResult.error || "CAPTCHA verification failed",
        },
        { status: 400 }
      );
    }

    // ============================================
    // 4. GET USER FROM DATABASE
    // ============================================
    const dbUser = await prisma.user.findUnique({
      where: { email: user.emailAddresses[0].emailAddress },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found", message: "User account not found in database" },
        { status: 404 }
      );
    }

    // ============================================
    // 5. FETCH EXISTING REVIEW
    // ============================================
    const existingReview = await prisma.review.findUnique({
      where: { id: data.reviewId },
      select: {
        id: true,
        userId: true,
        businessId: true,
        editableUntil: true,
        deletedAt: true,
        foodRating: true,
        serviceRating: true,
        ambienceRating: true,
        valueRating: true,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found", message: "The review you're trying to update does not exist" },
        { status: 404 }
      );
    }

    // ============================================
    // 6. CHECK OWNERSHIP
    // ============================================
    if (existingReview.userId !== dbUser.id) {
      return NextResponse.json(
        { error: "Forbidden", message: "You can only edit your own reviews" },
        { status: 403 }
      );
    }

    // ============================================
    // 7. CHECK IF REVIEW IS DELETED
    // ============================================
    if (existingReview.deletedAt) {
      return NextResponse.json(
        { error: "Review deleted", message: "Cannot edit a deleted review" },
        { status: 410 }
      );
    }

    // ============================================
    // 8. CHECK EDIT PERMISSION (24-hour window)
    // ============================================
    const editPermission = canEditReview(existingReview.editableUntil);

    if (!editPermission.canEdit) {
      return NextResponse.json(
        {
          error: "Edit window expired",
          message: editPermission.reason || "You can no longer edit this review",
        },
        { status: 403 }
      );
    }

    // ============================================
    // 9. PREPARE UPDATE DATA
    // ============================================
    const updateData: any = {
      lastEditedAt: new Date(),
    };

    // Only update fields that are provided
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.foodRating !== undefined) updateData.foodRating = data.foodRating;
    if (data.serviceRating !== undefined) updateData.serviceRating = data.serviceRating;
    if (data.ambienceRating !== undefined) updateData.ambienceRating = data.ambienceRating;
    if (data.valueRating !== undefined) updateData.valueRating = data.valueRating;

    // ============================================
    // 10. VALIDATE AT LEAST ONE DIMENSIONAL RATING EXISTS
    // ============================================
    const finalFoodRating = data.foodRating ?? existingReview.foodRating;
    const finalServiceRating = data.serviceRating ?? existingReview.serviceRating;
    const finalAmbienceRating = data.ambienceRating ?? existingReview.ambienceRating;
    const finalValueRating = data.valueRating ?? existingReview.valueRating;

    const hasAtLeastOneRating = [
      finalFoodRating,
      finalServiceRating,
      finalAmbienceRating,
      finalValueRating,
    ].some((rating) => rating !== null && rating !== undefined);

    if (!hasAtLeastOneRating) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "At least one dimensional rating (Food, Service, Ambience, or Value) is required",
        },
        { status: 400 }
      );
    }

    // ============================================
    // 11. UPDATE REVIEW
    // ============================================
    const updatedReview = await prisma.review.update({
      where: { id: data.reviewId },
      data: updateData,
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
    // 12. UPDATE BUSINESS STATS (if rating changed)
    // ============================================
    if (data.rating !== undefined) {
      await updateBusinessReviewStats(existingReview.businessId);
    }

    // ============================================
    // 13. RETURN SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        success: true,
        message: "Review updated successfully",
        review: {
          id: updatedReview.id,
          editableUntil: updatedReview.editableUntil,
          lastEditedAt: updatedReview.lastEditedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Review Update] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update review. Please try again later.",
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Updates business average rating and review count
 */
async function updateBusinessReviewStats(businessId: string) {
  try {
    const stats = await prisma.review.aggregate({
      where: {
        businessId,
        isPublished: true,
        deletedAt: null,
      },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.business.update({
      where: { id: businessId },
      data: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.id,
      },
    });
  } catch (error) {
    console.error("[Review Stats] Failed to update business stats:", error);
  }
}
