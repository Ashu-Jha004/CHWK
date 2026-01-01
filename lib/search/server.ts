import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  SearchResponse,
  BusinessSearchResult,
  SearchParams as GlobalSearchParams
} from "@/types/search/types";

interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  isVerified?: boolean;
  sortBy?: 'relevance' | 'rating' | 'recent';
}

// Internal interface for the raw SQL result
interface RawSearchResult extends Omit<BusinessSearchResult, 'categories'> {
  categories: any; // We'll parse this from JSON if needed, or Prisma might handle it
  rank: number;
}

export async function performSearch(params: SearchParams): Promise<SearchResponse> {
  const startTime = Date.now();
  const rawInput = (params.q || "").trim().slice(0, 200);
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 12));

  // Intent parsing
  const isTopRequested = /\b(top|best|highest rated)\b/i.test(rawInput);
  const isVerifiedRequested = params.isVerified || /\b(verified|trusted)\b/i.test(rawInput);

  // Clean search terms
  const cleanedInput = rawInput
    .replace(/\b(top|best|verified|trusted|in|at|near|me)\b/gi, "")
    .trim();

  const emptyResponse: SearchResponse = {
    results: [],
    pagination: { total: 0, page, limit, totalPages: 0, hasMore: false },
    filters: {
      appliedFilters: params as any,
      availableFilters: { categories: [], priceRanges: [], cities: [] }
    },
    metadata: { searchTime: 0, queryId: 'initial' }
  };

  if (!cleanedInput || cleanedInput.length < 2) return emptyResponse;

  try {
    let results: RawSearchResult[] = [];
    let strategy: 'fulltext' | 'fuzzy' | 'fallback' = 'fulltext';

    // Strategy 1: Full-text search with websearch
    results = await prisma.$queryRaw<RawSearchResult[]>`
      SELECT
        b."id", b."name", b."slug", b."coverImage", b."logo", b."averageRating",
        b."priceRange", b."isVerified", b."city", b."area", b."description",
        b."shortDescription", b."pincode", b."latitude", b."longitude", b."totalReviews",
        (
          SELECT COALESCE(json_agg(json_build_object(
            'id', c."id",
            'name', c."name",
            'slug', c."slug",
            'isPrimary', bc."isPrimary"
          )), '[]'::json)
          FROM "business_categories" bc
          JOIN "categories" c ON c."id" = bc."categoryId"
          WHERE bc."businessId" = b."id"
        ) AS categories,
        ts_rank_cd(
          setweight(to_tsvector('english', b."name"), 'A') ||
          setweight(b.search_vector, 'B'),
          websearch_to_tsquery('english', ${cleanedInput})
        ) AS rank
      FROM "businesses" b
      WHERE
        (
          setweight(to_tsvector('english', b."name"), 'A') ||
          setweight(b.search_vector, 'B')
        ) @@ websearch_to_tsquery('english', ${cleanedInput})
        AND b."status" = 'ACTIVE'
        ${isVerifiedRequested ? Prisma.sql`AND b."isVerified" = true` : Prisma.sql``}
        ${params.categoryId ? Prisma.sql`AND b."categoryId" = ${params.categoryId}` : Prisma.sql``}
      ORDER BY
        ${isTopRequested ? Prisma.sql`b."averageRating" DESC,` : Prisma.sql``}
        rank DESC
      LIMIT ${limit}
      OFFSET ${(page - 1) * limit};
    `;

    // Strategy 2: Fuzzy/similarity fallback
    if (results.length === 0) {
      strategy = 'fuzzy';
      results = await prisma.$queryRaw<RawSearchResult[]>`
        SELECT
          b."id", b."name", b."slug", b."coverImage", b."logo", b."averageRating",
          b."priceRange", b."isVerified", b."city", b."area", b."description",
          b."shortDescription", b."pincode", b."latitude", b."longitude", b."totalReviews",
          (
            SELECT COALESCE(json_agg(json_build_object(
              'id', c."id",
              'name', c."name",
              'slug', c."slug",
              'isPrimary', bc."isPrimary"
            )), '[]'::json)
            FROM "business_categories" bc
            JOIN "categories" c ON c."id" = bc."categoryId"
            WHERE bc."businessId" = b."id"
          ) AS categories,
          GREATEST(
            similarity(b."name", ${cleanedInput}),
            similarity(b."area", ${cleanedInput}),
            similarity(b."city", ${cleanedInput})
          ) AS rank
        FROM "businesses" b
        WHERE (
          b."name" % ${cleanedInput}
          OR b."area" % ${cleanedInput}
          OR b."city" % ${cleanedInput}
        )
        AND b."status" = 'ACTIVE'
        AND GREATEST(
          similarity(b."name", ${cleanedInput}),
          similarity(b."area", ${cleanedInput}),
          similarity(b."city", ${cleanedInput})
        ) > 0.3
        ${isVerifiedRequested ? Prisma.sql`AND b."isVerified" = true` : Prisma.sql``}
        ORDER BY rank DESC
        LIMIT ${limit};
      `;
    }

    // Get total count for pagination (only if results found)
    const totalCount = results.length > 0 ? await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM "businesses"
      WHERE search_vector @@ websearch_to_tsquery('english', ${cleanedInput})
        AND "status" = 'ACTIVE'
    ` : [{ count: BigInt(0) }];

    const total = Number(totalCount[0]?.count || 0);

    return {
      results: results as unknown as BusinessSearchResult[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      },
      filters: {
        appliedFilters: params as any,
        availableFilters: {
          categories: [],
          priceRanges: [],
          cities: []
        }
      },
      metadata: {
        searchTime: Date.now() - startTime,
        queryId: Math.random().toString(36).substring(7),
      }
    };

  } catch (error) {
    console.error("[Search Engine Error]:", {
      error,
      query: rawInput,
      timestamp: new Date().toISOString()
    });
    // Return empty with error metadata for debugging
    return {
      results: [],
      pagination: { total: 0, page, limit, totalPages: 0, hasMore: false },
      filters: {
        appliedFilters: params as any,
        availableFilters: { categories: [], priceRanges: [], cities: [] }
      },
      metadata: {
        searchTime: Date.now() - startTime,
        queryId: 'error',
      }
    };
  }
}
