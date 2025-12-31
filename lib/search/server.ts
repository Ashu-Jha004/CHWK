/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/search/server.ts
// Server-side search function (no HTTP overhead)

import { prisma } from "@/lib/prisma";
import { Prisma, PriceRange } from "@prisma/client";
import {
  parseSearchQuery,
  isValidCoordinates,
  sanitizeSearchInput,
  generateQueryId,
  shouldSuggestExpandRadius,
} from "./utils";
import { matchCategories } from "./category-matcher";
import { SearchParams, SearchResponse } from "@/types/search/types";

/**
 * Server-side search function
 * Can be called directly without HTTP request
 */
export async function performSearch(params: {
  q?: string;
  location?: string;
  lat?: string;
  lon?: string;
  radius?: string;
  category?: string;
  minRating?: string;
  priceRange?: string;
  verified?: string;
  page?: string;
  sort?: string;
}): Promise<SearchResponse> {
  const startTime = Date.now();
  const queryId = generateQueryId();

  try {
    // Convert string params to proper types
    const searchParams: SearchParams = {
      query: sanitizeSearchInput(params.q || ""),
      location: params.location,
      latitude: params.lat ? parseFloat(params.lat) : undefined,
      longitude: params.lon ? parseFloat(params.lon) : undefined,
      radius: params.radius ? parseInt(params.radius) : 10,
      categorySlug: params.category,
      priceRange: params.priceRange?.split(",") as PriceRange[],
      minRating: params.minRating ? parseFloat(params.minRating) : undefined,
      isVerified: params.verified === "true",
      page: params.page ? parseInt(params.page) : 1,
      limit: 12,
    };

    console.log(`[Search ${queryId}] Params:`, searchParams);

    // Parse search query
    const parsedQuery = parseSearchQuery(searchParams.query);
    console.log(`[Search ${queryId}] Parsed:`, parsedQuery);

    // Match categories
    const matchedCategories = await matchCategories(parsedQuery.cleanQuery, 3);
    const categoryIds = matchedCategories.map((c) => c.id);

    // Build the where clause
    const where = await buildWhereClause(
      searchParams,
      parsedQuery,
      categoryIds
    );

    // Determine if location-based search
    const isLocationSearch =
      parsedQuery.locationIntent.type === "nearme" &&
      isValidCoordinates(searchParams.latitude, searchParams.longitude);

    let businesses: any[] = [];
    let totalCount = 0;

    if (isLocationSearch && searchParams.latitude && searchParams.longitude) {
      const result = await searchWithDistance(
        where,
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
      const result = await searchRegular(
        where,
        searchParams.page || 1,
        searchParams.limit || 12,
        searchParams.sortBy || "relevance"
      );
      businesses = result.businesses;
      totalCount = result.totalCount;
    }

    // Transform results
    const results = businesses.map((business) => ({
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

    const searchTime = Date.now() - startTime;

    const response: SearchResponse = {
      results,
      pagination: {
        total: totalCount,
        page: searchParams.page || 1,
        limit: searchParams.limit || 12,
        totalPages: Math.ceil(totalCount / (searchParams.limit || 12)),
        hasMore:
          (searchParams.page || 1) <
          Math.ceil(totalCount / (searchParams.limit || 12)),
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
        expandRadius:
          isLocationSearch &&
          shouldSuggestExpandRadius(totalCount, searchParams.radius || 10),
        relatedSearches: matchedCategories.slice(0, 3).map((c) => c.name),
      },
      metadata: {
        searchTime,
        queryId,
      },
    };

    return response;
  } catch (error) {
    console.error(`[Search ${queryId}] Error:`, error);
    return createEmptyResponse(params, queryId);
  }
}

/**
 * Consolidated Where Clause Builder
 * Uses AND array to avoid property overwriting (especially for multiple OR conditions)
 */
async function buildWhereClause(
  params: SearchParams,
  parsedQuery: any,
  categoryIds: string[]
): Promise<Prisma.BusinessWhereInput> {
  const andConditions: Prisma.BusinessWhereInput[] = [
    { status: { in: ["ACTIVE", "CLAIMED"] } },
    { deletedAt: null },
  ];

  // 1. Text search
  if (parsedQuery.cleanQuery) {
    andConditions.push({
      OR: [
        { name: { contains: parsedQuery.cleanQuery, mode: "insensitive" } },
        {
          description: {
            contains: parsedQuery.cleanQuery,
            mode: "insensitive",
          },
        },
        { metadataKeywords: { hasSome: parsedQuery.intent } },
      ],
    });
  }

  // 2. Category filter
  if (params.categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: params.categorySlug },
      select: { id: true },
    });
    if (category) {
      andConditions.push({ categories: { some: { categoryId: category.id } } });
    }
  } else if (categoryIds.length > 0) {
    andConditions.push({
      categories: { some: { categoryId: { in: categoryIds } } },
    });
  }

  // 3. Location filter
  if (
    params.location &&
    !isValidCoordinates(params.latitude, params.longitude)
  ) {
    andConditions.push({
      OR: [
        { city: { contains: params.location, mode: "insensitive" } },
        { pincode: { equals: params.location } },
      ],
    });
  }

  // 4. Rating filter
  const ratingQualifier = parsedQuery.qualifiers.find(
    (q: any) => q.type === "rating"
  );
  const minRating = ratingQualifier
    ? ratingQualifier.filterValue
    : params.minRating;
  if (minRating) {
    andConditions.push({ averageRating: { gte: minRating } });
  }

  // 5. Price range filter
  const priceQualifier = parsedQuery.qualifiers.find(
    (q: any) => q.type === "price"
  );
  const priceRange = priceQualifier
    ? priceQualifier.filterValue
    : params.priceRange;
  if (priceRange && priceRange.length > 0) {
    andConditions.push({ priceRange: { in: priceRange } });
  }

  // 6. Verified filter
  if (params.isVerified) {
    andConditions.push({ isVerified: true });
  }

  return { AND: andConditions };
}

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
  // Haversine formula
  const distanceFormula = `(6371 * acos(cos(radians(${userLat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${userLon})) + sin(radians(${userLat})) * sin(radians(latitude))))`;

  const businessIdsInRadius: any[] = await prisma.$queryRaw`
    SELECT id, ${Prisma.raw(distanceFormula)} as distance
    FROM businesses
    WHERE ${Prisma.raw(distanceFormula)} <= ${radiusKm}
      AND status IN ('ACTIVE', 'CLAIMED')
      AND "deletedAt" IS NULL
    ORDER BY distance ASC
  `;

  const businessIds = businessIdsInRadius.map((b) => b.id);
  if (businessIds.length === 0) return { businesses: [], totalCount: 0 };

  const finalWhere = { ...where, id: { in: businessIds } };
  const totalCount = await prisma.business.count({ where: finalWhere });

  const businesses = await prisma.business.findMany({
    where: finalWhere,
    include: {
      categories: {
        include: { category: { select: { id: true, name: true, slug: true } } },
        where: { category: { isActive: true } },
      },
    },
    skip: offset,
    take: limit,
  });

  const businessesWithDistance = businesses.map((business) => {
    const distanceData = businessIdsInRadius.find((b) => b.id === business.id);
    return {
      ...business,
      distance: distanceData ? Number(distanceData.distance.toFixed(1)) : null,
    };
  });

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

async function searchRegular(
  where: Prisma.BusinessWhereInput,
  page: number,
  limit: number,
  sortBy: string
) {
  const offset = (page - 1) * limit;
  let orderBy: Prisma.BusinessOrderByWithRelationInput[] = [];

  if (sortBy === "rating") {
    orderBy = [{ averageRating: "desc" }, { totalReviews: "desc" }];
  } else if (sortBy === "reviews") {
    orderBy = [{ totalReviews: "desc" }, { averageRating: "desc" }];
  } else {
    orderBy = [
      { isVerified: "desc" },
      { averageRating: "desc" },
      { totalReviews: "desc" },
    ];
  }

  const totalCount = await prisma.business.count({ where });
  const businesses = await prisma.business.findMany({
    where,
    include: {
      categories: {
        include: { category: { select: { id: true, name: true, slug: true } } },
        where: { category: { isActive: true } },
      },
    },
    orderBy,
    skip: offset,
    take: limit,
  });

  return { businesses, totalCount };
}

function createEmptyResponse(params: any, queryId: string): SearchResponse {
  return {
    results: [],
    pagination: { total: 0, page: 1, limit: 12, totalPages: 0, hasMore: false },
    filters: {
      appliedFilters: {
        query: params.q || "",
        location: params.location,
        latitude: params.lat ? parseFloat(params.lat) : undefined,
        longitude: params.lon ? parseFloat(params.lon) : undefined,
        radius: params.radius ? parseInt(params.radius) : 10,
        categorySlug: params.category,
        priceRange: params.priceRange?.split(",") as any,
        minRating: params.minRating ? parseFloat(params.minRating) : undefined,
        isVerified: params.verified === "true",
        page: params.page ? parseInt(params.page) : 1,
        limit: 12,
      },
      availableFilters: { categories: [], priceRanges: [], cities: [] },
    },
    suggestions: { relatedSearches: [] },
    metadata: { searchTime: 0, queryId },
  };
}
