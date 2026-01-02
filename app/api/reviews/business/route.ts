// app/api/reviews/business/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/reviews/business?businessId=xxx&rating=5&hasResponse=false&sortBy=recent&page=1&limit=20
 * Fetches reviews for business owner dashboard with filters
 * Includes reviewer contact info (private to business owner)
 */
export async function GET(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTHENTICATION & INITIAL CHECKS
    // ============================================
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be signed in" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get("businessId");
    if (!businessId) {
      return NextResponse.json(
        { error: "Missing parameter", message: "Business ID is required" },
        { status: 400 }
      );
    }

    // Parallelize User lookup and Business ownership check
    const [dbUser, business] = await Promise.all([
      prisma.user.findUnique({
        where: { email: user.emailAddresses[0].emailAddress },
        select: { id: true },
      }),
      prisma.business.findUnique({
        where: { id: businessId },
        select: { id: true, ownerId: true },
      }),
    ]);

    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
    if (business.ownerId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ============================================
    // 2. PARSE FILTERS & BUILD QUERIES
    // ============================================
    const rating = searchParams.get("rating");
    const hasResponse = searchParams.get("hasResponse");
    const sortBy = searchParams.get("sortBy") || "recent";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const whereClause: any = {
      businessId,
      isPublished: true,
      deletedAt: null,
    };

    if (rating && rating !== "all") whereClause.rating = parseInt(rating);
    if (hasResponse === "true") whereClause.response = { isNot: null };
    else if (hasResponse === "false") whereClause.response = null;

    let orderBy: any;
    switch (sortBy) {
      case "oldest": orderBy = { createdAt: "asc" }; break;
      case "highest": orderBy = { rating: "desc" }; break;
      case "lowest": orderBy = { rating: "asc" }; break;
      case "needsResponse": orderBy = [{ response: { _count: "asc" } }, { createdAt: "desc" }]; break;
      default: orderBy = { createdAt: "desc" }; break;
    }

    // ============================================
    // 3. EXECUTE ALL DATA FETCHING IN PARALLEL
    // ============================================
    const [reviews, totalCount, stats] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true, email: true, phone: true },
          },
          photos: {
            where: { deletedAt: null, isApproved: true },
            select: { id: true, url: true, thumbnailUrl: true, caption: true },
          },
          response: {
            where: { deletedAt: null },
            include: {
              user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            },
          },
        },
      }),
      prisma.review.count({ where: whereClause }),
      calculateBusinessReviewStats(businessId),
    ]);

    const formattedReviews = reviews.map((review) => ({
      ...review,
      reviewerEmail: review.user.email,
      reviewerPhone: review.user.phone,
    }));

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("[Business Reviews Fetch] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function calculateBusinessReviewStats(businessId: string) {
  const commonWhere = {
    businessId,
    isPublished: true,
    deletedAt: null,
  };

  // Parallelize ALL stat queries into ONE Promise.all
  const [totalReviews, ratingBreakdown, responseCount, avgRatingResult] = await Promise.all([
    prisma.review.count({ where: commonWhere }),
    prisma.review.groupBy({
      by: ["rating"],
      where: commonWhere,
      _count: { rating: true },
    }),
    prisma.reviewResponse.count({
      where: {
        review: commonWhere,
        deletedAt: null,
      },
    }),
    prisma.review.aggregate({
      where: commonWhere,
      _avg: { rating: true },
    }),
  ]);

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratingBreakdown.forEach((item) => {
    breakdown[item.rating as keyof typeof breakdown] = item._count.rating;
  });

  const averageRating = avgRatingResult._avg.rating || 0;
  const responseRate = totalReviews > 0 ? (responseCount / totalReviews) * 100 : 0;

  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingBreakdown: breakdown,
    responseRate: Math.round(responseRate),
    reviewsNeedingResponse: totalReviews - responseCount,
  };
}
