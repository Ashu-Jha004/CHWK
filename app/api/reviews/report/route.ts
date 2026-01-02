// app/api/reviews/report/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { reportReviewSchema } from "@/lib/validations/review/review";

/**
 * POST /api/reviews/report
 * Reports a review for spam/fake/offensive content
 * Notifies admins for moderation
 */
export async function POST(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTHENTICATION CHECK
    // ============================================
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be signed in to report a review" },
        { status: 401 }
      );
    }

    // ============================================
    // 2. PARSE AND VALIDATE REQUEST BODY
    // ============================================
    const body = await request.json();
    const validation = reportReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Invalid report data",
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
    // 4. FETCH REVIEW
    // ============================================
    const review = await prisma.review.findUnique({
      where: { id: data.reviewId },
      select: {
        id: true,
        businessId: true,
        userId: true,
        deletedAt: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found", message: "The review does not exist" },
        { status: 404 }
      );
    }

    if (review.deletedAt) {
      return NextResponse.json(
        { error: "Review deleted", message: "Cannot report a deleted review" },
        { status: 410 }
      );
    }

    // ============================================
    // 5. PREVENT SELF-REPORTING
    // ============================================
    if (review.userId === dbUser.id) {
      return NextResponse.json(
        { error: "Self-report not allowed", message: "You cannot report your own review" },
        { status: 403 }
      );
    }

    // ============================================
    // 6. CHECK FOR DUPLICATE REPORTS
    // ============================================
    const existingReport = await prisma.report.findFirst({
      where: {
        reviewId: data.reviewId,
        reporterId: dbUser.id,
        status: { in: ["PENDING", "UNDER_REVIEW"] },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        {
          error: "Already reported",
          message: "You have already reported this review. It is under review by our team.",
        },
        { status: 409 }
      );
    }

    // ============================================
    // 7. GENERATE REPORT NUMBER
    // ============================================
    const reportNumber = `RPT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // ============================================
    // 8. CREATE REPORT
    // ============================================
    const report = await prisma.report.create({
      data: {
        reportNumber,
        reviewId: data.reviewId,
        reportedUserId: review.userId,
        reporterId: dbUser.id,
        businessId: review.businessId,
        reason: data.reason,
        category: data.category,
        description: data.description,
        status: "PENDING",
        priority: determinePriority(data.category),
      },
    });

    // ============================================
    // 9. TODO: NOTIFY ADMINS (Future Enhancement)
    // ============================================
    // In production, send notification to admin dashboard/email
    console.log(`[Report] New review report created: ${report.reportNumber}`);
    console.log(`[Report] Category: ${data.category}, Priority: ${report.priority}`);

    // ============================================
    // 10. RETURN SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        success: true,
        message: "Review reported successfully. Our team will review it shortly.",
        report: {
          reportNumber: report.reportNumber,
          category: report.category,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Report Review] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to submit report. Please try again later.",
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Determine report priority based on category
 */
function determinePriority(category: string): string {
  switch (category) {
    case "SPAM":
    case "FAKE":
      return "HIGH";
    case "OFFENSIVE":
      return "URGENT";
    case "IRRELEVANT":
      return "MEDIUM";
    case "OTHER":
    default:
      return "LOW";
  }
}
