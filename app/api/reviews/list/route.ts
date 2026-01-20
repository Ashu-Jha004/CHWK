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
    // 3. PREPARE DB QUERY PARAMS
    // ============================================
    const whereClause: any = {
      businessId: filters.businessId,
      isPublished: true,
      deletedAt: null,
    };

    if (filters.filterRating !== "all") {
      whereClause.rating = parseInt(filters.filterRating);
    }

    const orderBy = getReviewSortConfig(filters.sortBy);
    const skip = (filters.page - 1) * filters.limit;

    // ============================================
    // 4. START PARALLEL FETCHING
    // ============================================
    // Strategy: Fetch core data (reviews, count, business check) AND Auth simultaneously.
    // We do NOT wait for Auth to start fetching reviews. This removes Auth latency from the critical path for public data.

    const authPromise = currentUser();

    const businessCheckPromise = prisma.business.findUnique({
      where: { id: filters.businessId },
      select: { id: true },
    });

    // Fetch reviews WITHOUT user specific votes first
    const reviewsPromise = prisma.review.findMany({
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
          take: 5,
        },
        // We defer 'votes' fetching until we know the user
      },
    });

    const countPromise = prisma.review.count({ where: whereClause });

    // ============================================
    // 5. AWAIT RESULTS
    // ============================================
    const [user, business, reviews, totalCount] = await Promise.all([
      authPromise,
      businessCheckPromise,
      reviewsPromise,
      countPromise,
    ]);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found", message: "The business does not exist" },
        { status: 404 }
      );
    }

    // ============================================
    // 6. HANDLE AUTHENTICATED USER DATA (IF ANY)
    // ============================================
    let userReview: any = null;
    let votesMap: Record<string, boolean> = {};
    let dbUser: { id: string } | null = null;

    if (user) {
      // User is logged in, now we need to fetch their specific context
      // This part runs only after main data is theoretically ready (or alongside if they finish same time)
      dbUser = await prisma.user.findUnique({
        where: { email: user.emailAddresses[0].emailAddress },
        select: { id: true },
      });

      if (dbUser) {
        // Fetch User's review and their votes on the fetched reviews in parallel
        const [fetchedUserReview, fetchedVotes] = await Promise.all([
          prisma.review.findUnique({
            where: {
              userId_businessId: {
                userId: dbUser.id,
                businessId: filters.businessId,
              },
            },
            include: {
               user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
               photos: { where: { deletedAt: null, isApproved: true }, select: { id: true, url: true, thumbnailUrl: true } }
            }
          }),
          // Only fetch votes for the reviews we actually retrieved
          reviews.length > 0
            ? prisma.reviewVote.findMany({
                where: {
                  userId: dbUser.id,
                  reviewId: { in: reviews.map((r) => r.id) },
                },
                select: { reviewId: true, isHelpful: true },
              })
            : [],
        ]);

        userReview = fetchedUserReview;
        fetchedVotes.forEach((v) => {
          votesMap[v.reviewId] = v.isHelpful;
        });
      }
    }

    // ============================================
    // 7. MERGE & FORMAT RESPONSE
    // ============================================
    const canCreateReview = !!dbUser && !userReview;

    const formattedReviews = reviews.map((review) => ({
      ...review,
      userVote: votesMap[review.id] ? { isHelpful: votesMap[review.id] } : null,
    }));

    const totalPages = Math.ceil(totalCount / filters.limit);

    // ============================================
    // 8. RETURN SUCCESS RESPONSE
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
