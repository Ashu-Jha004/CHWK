// lib/search/category-matcher.ts
// Intelligent category matching using searchKeywords

import { prisma } from "@/lib/prisma";
import { CategoryMatch } from "@/types/search/types";
import { normalizeSearchTerm, calculateSimilarity } from "./utils";

/**
 * Match search query to categories using searchKeywords
 * @param query - User's search term (e.g., "plumber", "leak repair")
 * @param limit - Maximum number of category matches to return
 * @returns Array of matched categories with relevance scores
 */
export async function matchCategories(
  query: string,
  limit: number = 5
): Promise<CategoryMatch[]> {
  try {
    const startTime = Date.now();
    const normalizedQuery = normalizeSearchTerm(query);

    // Early return for empty query
    if (!normalizedQuery || normalizedQuery.length < 2) {
      return [];
    }

    // Use PostgreSQL pg_trgm for similarity matching
    // We check both the name and the searchKeywords array
    // The query is parameterized to prevent SQL injection
    const categories = await prisma.$queryRaw<Array<{
      id: string;
      slug: string;
      name: string;
      similarity: number;
    }>>`
      SELECT
        id,
        slug,
        name,
        GREATEST(
          similarity(name, ${normalizedQuery}),
          (
            SELECT MAX(similarity(keyword, ${normalizedQuery}))
            FROM unnest("searchKeywords") as keyword
          )
        ) as similarity
      FROM categories
      WHERE
        "isActive" = true
        AND (
          similarity(name, ${normalizedQuery}) > 0.3
          OR EXISTS (
            SELECT 1
            FROM unnest("searchKeywords") as keyword
            WHERE similarity(keyword, ${normalizedQuery}) > 0.3
          )
        )
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;

    const formattedMatches: CategoryMatch[] = categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      matchScore: Number(c.similarity) * 100, // Convert 0-1 to 0-100
      matchedKeyword: c.name // We simplify to just showing the category name as matched
    }));

    const timeTaken = Date.now() - startTime;
    console.log(
      `[matchCategories] Query: "${query}" | Matches: ${formattedMatches.length} | Time: ${timeTaken}ms`
    );

    return formattedMatches;
  } catch (error) {
    console.error(`[matchCategories] Error matching categories for query "${query}":`, error);
    // Return empty array on error (fail gracefully)
    return [];
  }
}

/**
 * Get category by slug (for direct category filtering)
 * @param slug - Category slug
 * @returns Category data or null
 */
export async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
      },
    });

    return category;
  } catch (error) {
    console.error("[getCategoryBySlug] Error fetching category:", error);
    return null;
  }
}

/**
 * Get popular categories for suggestions (homepage/empty state)
 * @param limit - Number of categories to return
 * @returns Popular categories sorted by business count
 */
export async function getPopularCategories(limit: number = 10) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        icon: true,
        totalBusinesses: true,
      },
      orderBy: [{ isFeatured: "desc" }, { totalBusinesses: "desc" }],
      take: limit,
    });

    return categories;
  } catch (error) {
    console.error("[getPopularCategories] Error:", error);
    return [];
  }
}

/**
 * Get related categories for "Did you mean?" suggestions
 * @param categoryId - Current category ID
 * @param limit - Number of related categories
 * @returns Related categories
 */
export async function getRelatedCategories(
  categoryId: string,
  limit: number = 5
) {
  try {
    // Get the current category to find its parent/siblings
    const currentCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        parentId: true,
        searchKeywords: true,
      },
    });

    if (!currentCategory) return [];

    // Get sibling categories (same parent)
    const relatedCategories = await prisma.category.findMany({
      where: {
        parentId: currentCategory.parentId,
        id: { not: categoryId },
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        totalBusinesses: true,
      },
      orderBy: {
        totalBusinesses: "desc",
      },
      take: limit,
    });

    return relatedCategories;
  } catch (error) {
    console.error("[getRelatedCategories] Error:", error);
    return [];
  }
}
