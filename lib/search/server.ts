import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  SearchResponse,
  BusinessSearchResult,
  SearchParams as GlobalSearchParams
} from "@/types/search/types";
import {
  parseSearchQuery,
  isOpenNow,
  isValidCoordinates
} from "@/lib/search/utils";
import { matchCategories } from "@/lib/search/category-matcher";
import { searchWithDistance, searchRegular } from "@/lib/search/search-service";
import { getSpellingSuggestion, findSimilarTerms, fuzzySearchBusinesses } from "@/lib/search/fuzzy-matcher";

export async function performSearch(params: GlobalSearchParams): Promise<SearchResponse> {
  const startTime = Date.now();
  const queryId = Math.random().toString(36).substring(7);

  // Use the shared parser
  const parsedQuery = parseSearchQuery(params.query || "");

  // 1. Parallelize category matching and potential fallback searches
  const [matchedCategories, spellingSuggestion, fuzzyResults] = await Promise.all([
    matchCategories(parsedQuery.cleanQuery, 3),
    parsedQuery.cleanQuery ? getSpellingSuggestion(parsedQuery.cleanQuery) : Promise.resolve(null),
    parsedQuery.cleanQuery ? fuzzySearchBusinesses(parsedQuery.cleanQuery, 5) : Promise.resolve([])
  ]);

  const categoryIds = matchedCategories.map(c => c.id);

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 12));

  // Build Where Clause (Mirroring route.ts logic)
  const where: Prisma.BusinessWhereInput = {
    status: { in: ["ACTIVE", "CLAIMED"] },
    deletedAt: null,
  };

  // Text Search (Name, Description, Keywords, PRODUCTS)
  if (parsedQuery.cleanQuery) {
    const orConditions: Prisma.BusinessWhereInput[] = [
      { name: { contains: parsedQuery.cleanQuery, mode: "insensitive" as const } },
      { description: { contains: parsedQuery.cleanQuery, mode: "insensitive" as const } },
      { metadataKeywords: { has: parsedQuery.cleanQuery } },
      {
        menuItems: {
          some: {
            OR: [
              { name: { contains: parsedQuery.cleanQuery, mode: "insensitive" as const } },
              { description: { contains: parsedQuery.cleanQuery, mode: "insensitive" as const } },
              { tags: { has: parsedQuery.cleanQuery } }
            ]
          }
        }
      }
    ];

    // If categories matched, include them in OR (not as strict AND filter)
    if (categoryIds.length > 0) {
      orConditions.push({
        categories: {
          some: { categoryId: { in: categoryIds } }
        }
      });
    }

    where.OR = orConditions;
  } else if (categoryIds.length > 0) {
    // If no query but categories found, only search by categories
    where.categories = {
      some: { categoryId: { in: categoryIds } }
    };
  }

  // User-specified category filter (strict)
  if (params.categorySlug) {
    where.categories = { some: { category: { slug: params.categorySlug } } };
  }

  // Check if location is just "Near me" or similar phrases (don't use as city filter)
  const isNearMePhrase = params.location &&
    /(near\s+me|nearby|close\s+to\s+me|around\s+me)/i.test(params.location);

  // Location Filter (City/Area/Pincode) - Only if NOT "near me" / GPS
  const isLocationSearch =
    isValidCoordinates(params.latitude, params.longitude) &&
    (parsedQuery.locationIntent.type === "nearme" || isNearMePhrase || !params.location);

  if (params.location && !isLocationSearch && !isNearMePhrase) {
     // Location must be added as AND with the existing OR conditions
     // We need to wrap it properly
     const existingOR = where.OR;

     if (existingOR) {
       // If we already have OR conditions, we need to combine them
       // The logic is: (existing OR conditions) AND (location matches)
       where.AND = [
         { OR: existingOR },
         {
           OR: [
             { city: { contains: params.location, mode: "insensitive" as const } },
             { area: { contains: params.location, mode: "insensitive" as const } },
             { pincode: { contains: params.location } },
           ]
         }
       ];
       delete where.OR;
     } else {
       // No existing OR, just add location filter
       where.OR = [
         { city: { contains: params.location, mode: "insensitive" as const } },
         { area: { contains: params.location, mode: "insensitive" as const } },
         { pincode: { contains: params.location } },
       ];
     }
  }

  // Filters
  if (params.isVerified) where.isVerified = true;
  if (params.priceRange && params.priceRange.length > 0) where.priceRange = { in: params.priceRange };
  if (params.minRating) where.averageRating = { gte: params.minRating };

  try {
    let result: { businesses: any[], totalCount: number };

    if (isLocationSearch && params.latitude && params.longitude) {
       result = await searchWithDistance(
         where,
         params.latitude,
         params.longitude,
         params.radius || 10,
         page,
         limit,
         params.sortBy || "distance"
       );
    } else {
       result = await searchRegular(
         where,
         page,
         limit,
         params.sortBy || 'relevance'
       );
    }



    // Transform results (Standardize to BusinessSearchResult)
    // searchWithDistance and searchRegular already return formatted-ish results
    // but we need to map categories format if needed.
    // Actually, search-service returns categories in nested format.
    // We need to flatten categories for the frontend type.

    // Check search-service output structure:
    // categories: { category: { id, name, slug } }[]
    // BusinessSearchResult expects categories: { id, name, slug, isPrimary }[]

    const results = result.businesses.map(b => ({
      ...b,
      categories: b.categories.map((c: any) => ({
        id: c.category.id,
        name: c.category.name,
        slug: c.category.slug,
        isPrimary: c.isPrimary || false
      })),
      // isOpen and distance are already calculated in service
    })) as unknown as BusinessSearchResult[];

    return {
      results,
      pagination: {
        total: result.totalCount,
        page,
        limit,
        totalPages: Math.ceil(result.totalCount / limit),
        hasMore: (page * limit) < result.totalCount
      },
      filters: {
        appliedFilters: params,
        availableFilters: {
            categories: matchedCategories.map(c => ({ slug: c.slug, name: c.name, count: 0 })),
            priceRanges: [],
            cities: []
        }
      },
      suggestions: {
        didYouMean: spellingSuggestion || undefined,
        relatedSearches: fuzzyResults.map(r => r.name).slice(0, 3),
      },
      metadata: {
        searchTime: Date.now() - startTime,
        queryId
      }
    };

  } catch (error) {
    console.error("[Search Engine SSR Error]:", error);
    return {
      results: [],
      pagination: { total: 0, page, limit, totalPages: 0, hasMore: false },
      filters: { appliedFilters: params, availableFilters: { categories: [], priceRanges: [], cities: [] } },
      metadata: { searchTime: Date.now() - startTime, queryId: 'error' }
    };
  }
}
