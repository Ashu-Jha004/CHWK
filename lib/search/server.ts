import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  isVerified?: boolean;
  sortBy?: 'relevance' | 'rating' | 'recent';
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  coverImage: string | null;
  logo: string | null;
  averageRating: number;
  priceRange: string;
  isVerified: boolean;
  city: string;
  area: string;
  rank: number;
}

interface SearchResponse {
  results: SearchResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  filters: {
    availableCategories: Array<{ id: string; count: number }>;
  };
  metadata: {
    searchTime: number;
    strategy: 'fulltext' | 'fuzzy' | 'fallback';
    query: string;
  };
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
    pagination: { total: 0, page, limit, hasMore: false },
    filters: { availableCategories: [] },
    metadata: { searchTime: 0, strategy: 'fallback', query: rawInput }
  };

  if (!cleanedInput || cleanedInput.length < 2) return emptyResponse;

  try {
    let results: SearchResult[] = [];
    let strategy: 'fulltext' | 'fuzzy' | 'fallback' = 'fulltext';

    // Strategy 1: Full-text search with websearch
    results = await prisma.$queryRaw<SearchResult[]>`
      SELECT
        "id", "name", "slug", "coverImage", "logo", "averageRating",
        "priceRange", "isVerified", "city", "area",
        ts_rank_cd(
          setweight(to_tsvector('english', "name"), 'A') ||
          setweight(search_vector, 'B'),
          websearch_to_tsquery('english', ${cleanedInput})
        ) AS rank
      FROM "businesses"
      WHERE
        (
          setweight(to_tsvector('english', "name"), 'A') ||
          setweight(search_vector, 'B')
        ) @@ websearch_to_tsquery('english', ${cleanedInput})
        AND "status" = 'ACTIVE'
        ${isVerifiedRequested ? Prisma.sql`AND "isVerified" = true` : Prisma.sql``}
        ${params.categoryId ? Prisma.sql`AND "categoryId" = ${params.categoryId}` : Prisma.sql``}
      ORDER BY
        ${isTopRequested ? Prisma.sql`"averageRating" DESC,` : Prisma.sql``}
        rank DESC
      LIMIT ${limit}
      OFFSET ${(page - 1) * limit};
    `;

    // Strategy 2: Fuzzy/similarity fallback
    if (results.length === 0) {
      strategy = 'fuzzy';
      results = await prisma.$queryRaw<SearchResult[]>`
        SELECT
          "id", "name", "slug", "coverImage", "logo", "averageRating",
          "priceRange", "isVerified", "city", "area",
          GREATEST(
            similarity("name", ${cleanedInput}),
            similarity("area", ${cleanedInput}),
            similarity("city", ${cleanedInput})
          ) AS rank
        FROM "businesses"
        WHERE (
          "name" % ${cleanedInput}
          OR "area" % ${cleanedInput}
          OR "city" % ${cleanedInput}
        )
        AND "status" = 'ACTIVE'
        AND GREATEST(
          similarity("name", ${cleanedInput}),
          similarity("area", ${cleanedInput}),
          similarity("city", ${cleanedInput})
        ) > 0.3
        ${isVerifiedRequested ? Prisma.sql`AND "isVerified" = true` : Prisma.sql``}
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
      results,
      pagination: {
        total,
        page,
        limit,
        hasMore: page * limit < total
      },
      filters: {
        availableCategories: [] // Implement async if needed
      },
      metadata: {
        searchTime: Date.now() - startTime,
        strategy,
        query: cleanedInput
      }
    };

  } catch (error) {
    console.error("[Search Engine Error]:", {
      error,
      query: rawInput,
      timestamp: new Date().toISOString()
    });
    // Return empty with error metadata for debugging
    return { ...emptyResponse, metadata: {
      searchTime: Date.now() - startTime,
      strategy: 'fallback',
      query: rawInput
    }};
  }
}
