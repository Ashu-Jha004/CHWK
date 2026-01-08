// API endpoint for search suggestions/autocomplete
// Returns matching businesses, categories, and keywords as user types

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface Suggestion {
  type: "business" | "category" | "keyword";
  value: string;
  label: string;
  slug?: string;
  metadata?: {
    city?: string;
    categoryName?: string;
    businessCount?: number;
  };
}

/**
 * GET /api/search/suggestions
 * Returns autocomplete suggestions based on partial query
 * Supports fuzzy matching for typos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q")?.trim();
    const limit = Math.min(10, parseInt(searchParams.get("limit") || "8"));

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Sanitize input to prevent SQL injection
    const sanitizedQuery = query.replace(/[^\w\s-]/gi, "");

    // Execute all queries in parallel for performance
    const [businessMatches, categoryMatches, keywordMatches] = await Promise.all([
      fetchBusinessSuggestions(sanitizedQuery, limit),
      fetchCategorySuggestions(sanitizedQuery, limit),
      fetchKeywordSuggestions(sanitizedQuery, limit),
    ]);

    // Combine and prioritize results
    const suggestions: Suggestion[] = [
      ...categoryMatches, // Categories first (most general)
      ...businessMatches, // Then businesses
      ...keywordMatches,  // Then keywords
    ].slice(0, limit); // Limit total results

    return NextResponse.json({
      suggestions,
      query,
      count: suggestions.length,
    });
  } catch (error) {
    console.error("[Suggestions API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch suggestions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch business name suggestions with fuzzy matching
 * Uses pg_trgm similarity for typo tolerance
 */
async function fetchBusinessSuggestions(
  query: string,
  limit: number
): Promise<Suggestion[]> {
  try {
    // Using similarity search with pg_trgm
    // SIMILARITY returns a score between 0 and 1
    const businesses = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        slug: string;
        city: string;
        categoryName: string;
        similarity: number;
      }>
    >`
      SELECT DISTINCT ON (b.id)
        b.id,
        b.name,
        b.slug,
        b.city,
        c.name as "categoryName",
        SIMILARITY(b.name, ${query}) as similarity
      FROM businesses b
      LEFT JOIN business_categories bc ON bc."businessId" = b.id AND bc."isPrimary" = true
      LEFT JOIN categories c ON c.id = bc."categoryId"
      WHERE
        b.status IN ('ACTIVE', 'CLAIMED')
        AND b."deletedAt" IS NULL
        AND (
          b.name ILIKE ${`%${query}%`}
          OR SIMILARITY(b.name, ${query}) > 0.2
        )
      ORDER BY b.id, similarity DESC
      LIMIT ${limit}
    `;

    return businesses.map((b) => ({
      type: "business" as const,
      value: b.name,
      label: b.name,
      slug: b.slug,
      metadata: {
        city: b.city,
        categoryName: b.categoryName,
      },
    }));
  } catch (error) {
    console.error("[fetchBusinessSuggestions] Error:", error);
    return [];
  }
}

/**
 * Fetch category suggestions with fuzzy matching
 */
async function fetchCategorySuggestions(
  query: string,
  limit: number
): Promise<Suggestion[]> {
  try {
    const categories = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        slug: string;
        totalBusinesses: number;
        similarity: number;
      }>
    >`
      SELECT
        c.id,
        c.name,
        c.slug,
        c."totalBusinesses",
        SIMILARITY(c.name, ${query}) as similarity
      FROM categories c
      WHERE
        c."isActive" = true
        AND (
          c.name ILIKE ${`%${query}%`}
          OR SIMILARITY(c.name, ${query}) > 0.3
          OR EXISTS (
            SELECT 1 FROM unnest(c."searchKeywords") AS keyword
            WHERE keyword ILIKE ${`%${query}%`}
          )
        )
      ORDER BY
        CASE
          WHEN c.name ILIKE ${`${query}%`} THEN 1
          WHEN c.name ILIKE ${`%${query}%`} THEN 2
          ELSE 3
        END,
        similarity DESC,
        c."totalBusinesses" DESC
      LIMIT ${limit}
    `;

    return categories.map((c) => ({
      type: "category" as const,
      value: c.name,
      label: c.name,
      slug: c.slug,
      metadata: {
        businessCount: c.totalBusinesses,
      },
    }));
  } catch (error) {
    console.error("[fetchCategorySuggestions] Error:", error);
    return [];
  }
}

/**
 * Fetch keyword suggestions from business metadata
 */
async function fetchKeywordSuggestions(
  query: string,
  limit: number
): Promise<Suggestion[]> {
  try {
    // Search in metadata keywords
    const keywords = await prisma.$queryRaw<
      Array<{
        keyword: string;
        count: bigint;
      }>
    >`
      SELECT
        keyword,
        COUNT(*) as count
      FROM (
        SELECT DISTINCT unnest("metadataKeywords") as keyword
        FROM businesses
        WHERE
          status IN ('ACTIVE', 'CLAIMED')
          AND "deletedAt" IS NULL
          AND EXISTS (
            SELECT 1 FROM unnest("metadataKeywords") AS kw
            WHERE kw ILIKE ${`%${query}%`}
          )
      ) AS keywords
      WHERE keyword ILIKE ${`%${query}%`}
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT ${limit}
    `;

    return keywords.map((k) => ({
      type: "keyword" as const,
      value: k.keyword,
      label: k.keyword,
      metadata: {
        businessCount: Number(k.count),
      },
    }));
  } catch (error) {
    console.error("[fetchKeywordSuggestions] Error:", error);
    return [];
  }
}
