// app/api/reviews/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { sendNewReviewNotification } from "@/lib/services/email";
import { prisma } from "@/lib/prisma";
import { createReviewSchema } from "@/lib/validations/review/review";
import { verifyTurnstileToken } from "@/lib/services/turnstile";
import { Prisma } from "@prisma/client";

/**
 * POST /api/reviews/create
 * Creates a new review for a business
 */
export async function POST(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTHENTICATION CHECK
    // ============================================
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be signed in to create a review" },
        { status: 401 }
      );
    }

    // ============================================
    // 2. EMAIL VERIFICATION CHECK
    // ============================================
    const emailVerified = user.emailAddresses.some(
      (email) => email.id === user.primaryEmailAddressId && email.verification?.status === "verified"
    );

    if (!emailVerified) {
      return NextResponse.json(
        { error: "Email not verified", message: "Please verify your email before creating a review" },
        { status: 403 }
      );
    }

    // ============================================
    // 3. PARSE AND VALIDATE REQUEST BODY
    // ============================================
    const body = await request.json();
    const validation = createReviewSchema.safeParse(body);

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
    // 4. CLOUDFLARE TURNSTILE VERIFICATION
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
    // 5. CHECK IF USER IN DATABASE
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
    // 6. CHECK IF BUSINESS EXISTS
    // ============================================
    const business = await prisma.business.findUnique({
      where: { id: data.businessId },
      select: { id: true, name: true, ownerId: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found", message: "The business you're trying to review does not exist" },
        { status: 404 }
      );
    }

    // ============================================
    // 7. CHECK FOR EXISTING REVIEW (one user-one business-one review)
    // ============================================
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_businessId: {
          userId: dbUser.id,
          businessId: data.businessId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          error: "Review already exists",
          message: "You have already reviewed this business. You can edit your existing review instead.",
        },
        { status: 409 }
      );
    }

    // ============================================
    // 8. CHECK VERIFIED PURCHASE (if orderId or bookingId provided)
    // ============================================
    let isVerifiedPurchase = false;

    if (data.orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: data.orderId,
          userId: dbUser.id,
          businessId: data.businessId,
          status: "DELIVERED",
        },
      });
      isVerifiedPurchase = !!order;
    } else if (data.bookingId) {
      const booking = await prisma.booking.findFirst({
        where: {
          id: data.bookingId,
          userId: dbUser.id,
          businessId: data.businessId,
          status: "COMPLETED",
        },
      });
      isVerifiedPurchase = !!booking;
    }

    // ============================================
    // 9. CREATE REVIEW (with 24-hour edit window)
    // ============================================
    const editableUntil = new Date();
    editableUntil.setHours(editableUntil.getHours() + 24); // 24-hour edit window

    const review = await prisma.review.create({
      data: {
        userId: dbUser.id,
        businessId: data.businessId,
        rating: data.rating,
        title: data.title,
        content: data.content,
        visitDate: data.visitDate,
        visitType: data.visitType,
        orderId: data.orderId,
        bookingId: data.bookingId,
        foodRating: data.foodRating,
        serviceRating: data.serviceRating,
        ambienceRating: data.ambienceRating,
        valueRating: data.valueRating,
        isVerifiedPurchase,
        verificationStatus: "UNVERIFIED", // Will be updated when photos uploaded
        status: "APPROVED", // Direct publish
        isPublished: true,
        publishedAt: new Date(),
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
    // 10. UPDATE BUSINESS STATS
    // ============================================
    await updateBusinessReviewStats(data.businessId);

    // ============================================
    // 11. SEND EMAIL NOTIFICATION TO BUSINESS OWNER
    // ============================================
   // ============================================
// 11. SEND EMAIL NOTIFICATION TO BUSINESS OWNER
// ============================================
if (business.ownerId) {
  try {
    // Fetch business owner details
    const businessOwner = await prisma.user.findUnique({
      where: { id: business.ownerId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (businessOwner?.email) {
      // Import email service at the top of the file
      const { sendNewReviewNotification } = await import("@/lib/services/email");

      // Send email asynchronously (don't wait for it)
      sendNewReviewNotification({
        businessOwnerName: `${businessOwner.firstName || ""} ${businessOwner.lastName || ""}`.trim() || "Business Owner",
        businessOwnerEmail: businessOwner.email,
        businessName: business.name,
        businessId: data.businessId,
        reviewerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "A customer",
        rating: data.rating,
        reviewTitle: data.title,
        reviewContent: data.content,
        reviewId: review.id,
        createdAt: review.createdAt,
      }).catch((error) => {
        // Log error but don't fail the request
        console.error("[Review Create] Email notification failed:", error);
      });


    }
  } catch (error) {
    // Log error but don't fail the review creation
    console.error("[Review Create] Failed to send email notification:", error);
  }
}


    // ============================================
    // 12. RETURN SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        success: true,
        message: "Review created successfully",
        review: {
          id: review.id,
          editableUntil: review.editableUntil,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Review Create] Error:", error);

    // Handle Prisma unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Duplicate review", message: "You have already reviewed this business" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create review. Please try again later.",
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
    // Don't throw - this is a non-critical operation
  }
}
