
// Main search API endpoint with intelligent filtering and location-based search

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, PriceRange } from "@prisma/client";
import {
  parseSearchQuery,
  isValidCoordinates,
  sanitizeSearchInput,
  generateQueryId,
  shouldSuggestExpandRadius,
  buildSearchPattern,
} from "@/lib/search/utils";
import { matchCategories } from "@/lib/search/category-matcher";
import {
  SearchParams,
  SearchResponse,
  BusinessSearchResult,
} from "@/types/search/types";

/**
 * GET /api/search
 * Main search endpoint with filters, location, and pagination
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const queryId = generateQueryId();

  try {
    // 1. Extract and validate search parameters
    const searchParams = extractSearchParams(request);
    console.log(`[Search ${queryId}] Params:`, searchParams);

    // 2. Parse search query to extract intent
    const parsedQuery = parseSearchQuery(searchParams.query);
    console.log(`[Search ${queryId}] Parsed:`, parsedQuery);

    // 3. Match categories based on query
    const matchedCategories = await matchCategories(parsedQuery.cleanQuery, 3);
    console.log(
      `[Search ${queryId}] Matched categories:`,
      matchedCategories.map((c) => c.name)
    );

    // 4. Build Prisma where clause
    const whereClause = await buildWhereClause(
      searchParams,
      parsedQuery,
      matchedCategories.map((c) => c.id)
    );

    // 5. Determine if location-based search
    const isLocationSearch =
      parsedQuery.locationIntent.type === "nearme" &&
      isValidCoordinates(searchParams.latitude, searchParams.longitude);

    let businesses: any[] = [];
    let totalCount = 0;

    if (isLocationSearch && searchParams.latitude && searchParams.longitude) {
      // Location-based search with Haversine distance calculation
      const result = await searchWithDistance(
        whereClause,
        searchParams.latitude,
        searchParams.longitude,
        searchParams.radius || 10,
        searchParams.page || 1,
        searchParams.limit || 12,
        searchParams.sortBy || "distance"
      );
      businesses = result.businesses;
      totalCount = result.totalCount;
    } else {
      // Regular search without distance calculation
      const result = await searchRegular(
        whereClause,
        searchParams.page || 1,
        searchParams.limit || 12,
        searchParams.sortBy || "relevance"
      );
      businesses = result.businesses;
      totalCount = result.totalCount;
    }

    // 6. Transform results
    const results: BusinessSearchResult[] = businesses.map((business) => ({
      id: business.id,
      slug: business.slug,
      name: business.name,
      description: business.description,
      shortDescription: business.shortDescription,
      logo: business.logo,
      coverImage: business.coverImage,
      city: business.city,
      area: business.area,
      pincode: business.pincode,
      latitude: business.latitude,
      longitude: business.longitude,
      distance: business.distance,
      averageRating: business.averageRating,
      totalReviews: business.totalReviews,
      priceRange: business.priceRange,
      isVerified: business.isVerified,
      categories: business.categories.map((bc: any) => ({
        id: bc.category.id,
        name: bc.category.name,
        slug: bc.category.slug,
        isPrimary: bc.isPrimary,
      })),
    }));

    // 7. Build pagination metadata
    const page = searchParams.page || 1;
    const limit = searchParams.limit || 12;
    const totalPages = Math.ceil(totalCount / limit);

    // 8. Check if should suggest expanding radius
    const expandRadius =
      isLocationSearch &&
      shouldSuggestExpandRadius(totalCount, searchParams.radius || 10);

    // 9. Build response
    const searchTime = Date.now() - startTime;
    const response: SearchResponse = {
      results,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
      filters: {
        appliedFilters: searchParams,
        availableFilters: {
          categories: matchedCategories.map((c) => ({
            slug: c.slug,
            name: c.name,
            count: 0, // TODO: Implement count aggregation
          })),
          priceRanges: [],
          cities: [],
        },
      },
      suggestions: {
        expandRadius: expandRadius ? true : undefined,
        relatedSearches: matchedCategories.slice(0, 3).map((c) => c.name),
      },
      metadata: {
        searchTime,
        queryId,
      },
    };

    console.log(
      `[Search ${queryId}] Completed in ${searchTime}ms | Results: ${totalCount}`
    );

    // 10. Log search query for analytics (fire-and-forget)
    logSearchQuery(searchParams, parsedQuery, totalCount, queryId).catch(
      (err) => console.error("Error logging search:", err)
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error(`[Search ${queryId}] Error:`, error);
    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
        queryId,
      },
      { status: 500 }
    );
  }
}

/**
 * Extract and validate search parameters from request
 * FIXED: Properly decode URL parameters
 */
function extractSearchParams(request: NextRequest): SearchParams {
  const { searchParams } = request.nextUrl;

  // FIXED: Properly decode URL-encoded parameters
  const rawQuery = searchParams.get("q") || "";
  const query = sanitizeSearchInput(
    rawQuery ? decodeURIComponent(rawQuery) : ""
  );

  const rawLocation = searchParams.get("location");
  const location = rawLocation ? decodeURIComponent(rawLocation) : undefined;

  const latitude = parseFloat(searchParams.get("lat") || "");
  const longitude = parseFloat(searchParams.get("lon") || "");
  const radius = parseInt(searchParams.get("radius") || "10");
  const categorySlug = searchParams.get("category") || undefined;
  const minRating =
    parseFloat(searchParams.get("minRating") || "0") || undefined;
  const isVerified = searchParams.get("verified") === "true" || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") || "12"))
  );
  const sortBy = (searchParams.get("sort") as any) || "relevance";

  // Parse price ranges
  const priceRangesParam = searchParams.get("priceRange");
  const priceRange = priceRangesParam
    ? (priceRangesParam.split(",") as PriceRange[])
    : undefined;

  return {
    query,
    location,
    latitude: isNaN(latitude) ? undefined : latitude,
    longitude: isNaN(longitude) ? undefined : longitude,
    radius,
    categorySlug,
    priceRange,
    minRating,
    isVerified,
    page,
    limit,
    sortBy,
  };
}

/**
 * Build Prisma where clause based on filters
 */
async function buildWhereClause(
  params: SearchParams,
  parsedQuery: any,
  categoryIds: string[]
): Promise<Prisma.BusinessWhereInput> {
  const where: Prisma.BusinessWhereInput = {
    status: { in: ["ACTIVE", "CLAIMED"] },
    deletedAt: null,
  };

  // Text search on name, description, and keywords
  if (parsedQuery.cleanQuery) {
    const searchPattern = buildSearchPattern(parsedQuery.cleanQuery);
    where.OR = [
      { name: { contains: parsedQuery.cleanQuery, mode: "insensitive" } },
      {
        description: { contains: parsedQuery.cleanQuery, mode: "insensitive" },
      },
      { metadataKeywords: { hasSome: parsedQuery.intent } },
    ];
  }

  // Category filter (from matched categories or explicit filter)
  if (params.categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: params.categorySlug },
      select: { id: true },
    });
    if (category) {
      where.categories = {
        some: { categoryId: category.id },
      };
    }
  } else if (categoryIds.length > 0) {
    where.categories = {
      some: { categoryId: { in: categoryIds } },
    };
  }

  // Location filter (city/pincode) - only if NOT using GPS
  if (
    params.location &&
    !isValidCoordinates(params.latitude, params.longitude)
  ) {
    where.OR = [
      { city: { contains: params.location, mode: "insensitive" } },
      { pincode: { equals: params.location } },
    ];
  }

  // Rating filter (from qualifiers or explicit)
  const ratingQualifier = parsedQuery.qualifiers.find(
    (q: any) => q.type === "rating"
  );
  if (ratingQualifier) {
    where.averageRating = { gte: ratingQualifier.filterValue };
  } else if (params.minRating) {
    where.averageRating = { gte: params.minRating };
  }

  // Price range filter (from qualifiers or explicit)
  const priceQualifier = parsedQuery.qualifiers.find(
    (q: any) => q.type === "price"
  );
  if (priceQualifier) {
    where.priceRange = { in: priceQualifier.filterValue };
  } else if (params.priceRange && params.priceRange.length > 0) {
    where.priceRange = { in: params.priceRange };
  }

  // Verified filter
  if (params.isVerified) {
    where.isVerified = true;
  }

  return where;
}

/**
 * Search with distance calculation (Haversine formula via raw SQL)
 */
async function searchWithDistance(
  where: Prisma.BusinessWhereInput,
  userLat: number,
  userLon: number,
  radiusKm: number,
  page: number,
  limit: number,
  sortBy: string
) {
  const offset = (page - 1) * limit;

  // Build SQL for distance calculation
  const distanceFormula = `
    (6371 * acos(
      cos(radians(${userLat})) *
      cos(radians(latitude)) *
      cos(radians(longitude) - radians(${userLon})) +
      sin(radians(${userLat})) *
      sin(radians(latitude))
    ))
  `;

  // Get business IDs within radius using raw SQL
  const businessIdsInRadius: any[] = await prisma.$queryRaw`
    SELECT
      id,
      ${Prisma.raw(distanceFormula)} as distance
    FROM businesses
    WHERE
      ${Prisma.raw(distanceFormula)} <= ${radiusKm}
      AND status IN ('ACTIVE', 'CLAIMED')
      AND "deletedAt" IS NULL
    ORDER BY distance ASC
  `;

  const businessIds = businessIdsInRadius.map((b) => b.id);

  if (businessIds.length === 0) {
    return { businesses: [], totalCount: 0 };
  }

  // Add ID filter to where clause
  const finalWhere: Prisma.BusinessWhereInput = {
    ...where,
    id: { in: businessIds },
  };

  // Get total count
  const totalCount = await prisma.business.count({ where: finalWhere });

  // Get businesses with categories
  const businesses = await prisma.business.findMany({
    where: finalWhere,
    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        where: {
          category: {
            isActive: true,
          },
        },
      },
    },
    skip: offset,
    take: limit,
  });

  // Add distance to each business
  const businessesWithDistance = businesses.map((business) => {
    const distanceData = businessIdsInRadius.find((b) => b.id === business.id);
    return {
      ...business,
      distance: distanceData ? Number(distanceData.distance.toFixed(1)) : null,
    };
  });

  // Sort based on sortBy parameter
  if (sortBy === "distance") {
    businessesWithDistance.sort(
      (a, b) => (a.distance || 999) - (b.distance || 999)
    );
  } else if (sortBy === "rating") {
    businessesWithDistance.sort(
      (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
    );
  } else if (sortBy === "reviews") {
    businessesWithDistance.sort((a, b) => b.totalReviews - a.totalReviews);
  }

  return { businesses: businessesWithDistance, totalCount };
}

/**
 * Regular search without distance calculation
 */
async function searchRegular(
  where: Prisma.BusinessWhereInput,
  page: number,
  limit: number,
  sortBy: string
) {
  const offset = (page - 1) * limit;

  // Determine order by
  let orderBy: Prisma.BusinessOrderByWithRelationInput[] = [];

  if (sortBy === "rating") {
    orderBy = [{ averageRating: "desc" }, { totalReviews: "desc" }];
  } else if (sortBy === "reviews") {
    orderBy = [{ totalReviews: "desc" }, { averageRating: "desc" }];
  } else {
    // Relevance: prioritize verified, then rating
    orderBy = [
      { isVerified: "desc" },
      { averageRating: "desc" },
      { totalReviews: "desc" },
    ];
  }

  // Get total count
  const totalCount = await prisma.business.count({ where });

  // Get businesses
  const businesses = await prisma.business.findMany({
    where,
    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        where: {
          category: {
            isActive: true,
          },
        },
      },
    },
    orderBy,
    skip: offset,
    take: limit,
  });

  return { businesses, totalCount };
}

/**
 * Log search query for analytics
 */
async function logSearchQuery(
  params: SearchParams,
  parsedQuery: any,
  resultCount: number,
  queryId: string
) {
  try {
    await prisma.searchQuery.create({
      data: {
        query: params.query,
        queryType: "TEXT",
        pincode: params.location || null,
        city: params.location || null,
        latitude: params.latitude || null,
        longitude: params.longitude || null,
        radius: params.radius ? params.radius * 1000 : null, // Convert to meters
        categoryFilter: params.categorySlug || null,
        priceRangeFilter: params.priceRange?.join(",") || null,
        ratingFilter: params.minRating || null,
        sortBy: params.sortBy || "relevance",
        resultCount,
        noResultsFound: resultCount === 0,
        sessionId: queryId, // Using queryId as sessionId for now
      },
    });
  } catch (error) {
    console.error("[logSearchQuery] Error:", error);
    // Don't throw - analytics logging should not break search
  }
}
