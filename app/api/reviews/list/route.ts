// app/api/reviews/list/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { reviewFiltersSchema } from "@/lib/validations/review/review";
import { getReviewSortConfig } from "@/lib/utils/review-utils";

/**
 * GET /api/reviews/list?businessId=xxx&sortBy=recent&filterRating=all&page=1&limit=10
 * Fetches reviews for a business with filtering and sorting
 */
export async function GET(request: NextRequest) {
  try {
    // ============================================
    // 1. PARSE QUERY PARAMETERS
    // ============================================
    const searchParams = request.nextUrl.searchParams;

    const queryData = {
      businessId: searchParams.get("businessId") || "",
      sortBy: searchParams.get("sortBy") || "recent",
      filterRating: searchParams.get("filterRating") || "all",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
    };

    // ============================================
    // 2. VALIDATE QUERY PARAMETERS
    // ============================================
    const validation = reviewFiltersSchema.safeParse(queryData);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Invalid query parameters",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const filters = validation.data;

    // ============================================
    // 3. PARALLEL CHECK: AUTH & BUSINESS EXISTENCE
    // ============================================
    const [user, business] = await Promise.all([
      currentUser(),
      prisma.business.findUnique({
        where: { id: filters.businessId },
        select: { id: true },
      }),
    ]);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found", message: "The business does not exist" },
        { status: 404 }
      );
    }

    let dbUser: { id: string } | null = null;
    if (user) {
      dbUser = await prisma.user.findUnique({
        where: { email: user.emailAddresses[0].emailAddress },
        select: { id: true },
      });
    }

    // ============================================
    // 5. BUILD WHERE CLAUSE
    // ============================================
    const whereClause: any = {
      businessId: filters.businessId,
      isPublished: true,
      deletedAt: null,
    };

    // Filter by rating
    if (filters.filterRating !== "all") {
      whereClause.rating = parseInt(filters.filterRating);
    }

    // ============================================
    // 6. GET SORT CONFIGURATION
    // ============================================
    const orderBy = getReviewSortConfig(filters.sortBy);

    // ============================================
    // 7. CALCULATE PAGINATION
    // ============================================
    const skip = (filters.page - 1) * filters.limit;

    // ============================================
    // 8. FETCH REVIEWS WITH USER VOTE STATUS
    // ============================================
    // ============================================
    // 8. PARALLEL FETCH: REVIEWS, COUNT, USER REVIEW
    // ============================================
    const [reviews, totalCount, userReview] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: filters.limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          photos: {
            where: {
              deletedAt: null,
              isApproved: true,
            },
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              caption: true,
            },
            take: 5, // Reduced take for better performance
          },
          votes: dbUser
            ? {
                where: { userId: dbUser.id },
                select: { isHelpful: true },
              }
            : false,
        },
      }),
      prisma.review.count({ where: whereClause }),
      dbUser
        ? prisma.review.findUnique({
            where: {
              userId_businessId: {
                userId: dbUser.id,
                businessId: filters.businessId,
              },
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
              photos: {
                where: { deletedAt: null, isApproved: true },
                select: {
                  id: true,
                  url: true,
                  thumbnailUrl: true,
                  caption: true,
                },
              },
            },
          })
        : Promise.resolve(null),
    ]);

    const canCreateReview = !!dbUser && !userReview;

    // ============================================
    // 10. FORMAT RESPONSE
    // ============================================
    const formattedReviews = reviews.map((review) => ({
      ...review,
      userVote: review.votes?.[0] || null,
      votes: undefined, // Remove votes array from response
    }));

    const totalPages = Math.ceil(totalCount / filters.limit);

    // ============================================
    // 11. RETURN SUCCESS RESPONSE
    // ============================================
    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      pagination: {
        total: totalCount,
        page: filters.page,
        limit: filters.limit,
        totalPages,
      },
      userReview,
      canCreateReview,
    });
  } catch (error) {
    console.error("[Review List] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch reviews. Please try again later.",
      },
      { status: 500 }
    );
  }
}
