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
  isOpenNow,
} from "@/lib/search/utils";
import { matchCategories } from "@/lib/search/category-matcher";
import { searchWithDistance, searchRegular } from "@/lib/search/search-service";
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


    // 2. Parse search query to extract intent
    const parsedQuery = parseSearchQuery(searchParams.query);


    // 3. Match categories based on query
    const matchedCategories = await matchCategories(parsedQuery.cleanQuery, 3);


    // 4. Build Prisma where clause
    const whereClause = await buildWhereClause(
      searchParams,
      parsedQuery,
      matchedCategories.map((c) => c.id)
    );

    // 5. Determine if location-based search
    // Only use GPS if: user said "near me" OR no location text provided
    // DO NOT use GPS if user typed "Hyderabad" even if browser sends coordinates
    const isNearMePhrase = searchParams.location &&
      /(near\s+me|nearby|close\s+to\s+me|around\s+me)/i.test(searchParams.location as string);

    const isLocationSearch =
      isValidCoordinates(searchParams.latitude, searchParams.longitude) &&
      (parsedQuery.locationIntent.type === "nearme" ||
       isNearMePhrase ||
       !searchParams.location);

    let businesses: BusinessSearchResult[] = []; // Changed type to BusinessSearchResult[]
    let totalCount = 0;
    let expandedRadius = false;

    // Helper to execute search
    const executeSearch = async (radiusOverride?: number) => {
      if (isLocationSearch && searchParams.latitude && searchParams.longitude) {
        return await searchWithDistance(
          whereClause,
          searchParams.latitude,
          searchParams.longitude,
          radiusOverride || searchParams.radius || 10,
          searchParams.page || 1,
          searchParams.limit || 12,
          searchParams.sortBy || "distance"
        );
      } else {
        return await searchRegular(
          whereClause,
          searchParams.page || 1,
          searchParams.limit || 12,
          searchParams.sortBy || "relevance"
        );
      }
    };

    // Initial Search
    let result = await executeSearch();
    businesses = result.businesses.map((b: any) => ({
        ...b,
        categories: b.categories?.map((c: any) => ({
            id: c.category.id,
            name: c.category.name,
            slug: c.category.slug,
            isPrimary: c.isPrimary || false
        })) || []
    })) as unknown as BusinessSearchResult[];
    totalCount = result.totalCount;

    // SAFETY NET: Zero-Result Fallback
    if (totalCount === 0 && isLocationSearch) {
       const currentRadius = searchParams.radius || 10;
       if (currentRadius < 50) { // Max limit
         const newRadius = currentRadius * 2;


         // Retry with expanded radius
         result = await executeSearch(newRadius);
         if (result.totalCount > 0) {
            businesses = result.businesses.map((b: any) => ({
                ...b,
                categories: b.categories?.map((c: any) => ({
                    id: c.category.id,
                    name: c.category.name,
                    slug: c.category.slug,
                    isPrimary: c.isPrimary || false
                })) || []
            })) as unknown as BusinessSearchResult[];
           totalCount = result.totalCount;
           expandedRadius = true;
         }
       }
    }

    // 6. Build pagination metadata
    const page = searchParams.page || 1;
    const limit = searchParams.limit || 12;
    const totalPages = Math.ceil(totalCount / limit);
    const expandRadius = shouldSuggestExpandRadius(totalCount, searchParams.radius || 10);

    // 7. Build response
    const searchTime = Date.now() - startTime;
    const response: SearchResponse = {
      results: businesses,
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
            count: 0,
          })),
          priceRanges: [],
          cities: [],
        },
      },
      suggestions: {
        expandRadius: expandRadius || expandedRadius ? true : undefined,
        relatedSearches: matchedCategories.slice(0, 3).map((c) => c.name),
      },
      metadata: {
        searchTime,
        queryId,
      },
    };



    // 8. Log search query for analytics (fire-and-forget)
    logSearchQuery(searchParams, parsedQuery, totalCount, queryId).catch(
      (err) => console.error("Error logging search:", err)
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error(`[Search] Error:`, error);
    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
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

  // Text search on name, description, keywords, AND menu items (Products/Services)
  // Enhanced to support fuzzy matching via ILIKE (contains with insensitive mode)
  if (parsedQuery.cleanQuery) {
    const searchPattern = buildSearchPattern(parsedQuery.cleanQuery);
    where.OR = [
      { name: { contains: parsedQuery.cleanQuery, mode: "insensitive" } },
      {
        description: { contains: parsedQuery.cleanQuery, mode: "insensitive" },
      },
      // Meta-keyword search - supports partial matching
      { metadataKeywords: { has: parsedQuery.cleanQuery } },
      // Product/Service Search: Check menu items
      {
        menuItems: {
          some: {
            OR: [
              { name: { contains: parsedQuery.cleanQuery, mode: "insensitive" } },
              { description: { contains: parsedQuery.cleanQuery, mode: "insensitive" } },
              { tags: { has: parsedQuery.cleanQuery } }
            ]
          }
        }
      }
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
  const isNearMePhrase = params.location &&
    /(near\s+me|nearby|close\s+to\s+me|around\s+me)/i.test(params.location);

  if (params.location && !isValidCoordinates(params.latitude, params.longitude) && !isNearMePhrase) {
    const existingOR = where.OR;

    if (existingOR) {
      // Combine with existing OR using AND
      where.AND = [
        { OR: existingOR },
        {
          OR: [
            { city: { contains: params.location, mode: "insensitive" as const } },
            { area: { contains: params.location, mode: "insensitive" as const } },
            { pincode: { equals: params.location } },
          ]
        }
      ];
      delete where.OR;
    } else {
      where.OR = [
        { city: { contains: params.location, mode: "insensitive" as const } },
        { area: { contains: params.location, mode: "insensitive" as const } },
        { pincode: { equals: params.location } },
      ];
    }
  }

  // Rating filter (from extracted filters or explicit)
  if (parsedQuery.extractedFilters?.minRating) {
    where.averageRating = { gte: parsedQuery.extractedFilters.minRating };
  } else if (params.minRating) {
    where.averageRating = { gte: params.minRating };
  }

  // Price range filter (from extracted filters or explicit)
  if (parsedQuery.extractedFilters?.priceRange) {
    where.priceRange = { in: parsedQuery.extractedFilters.priceRange };
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
