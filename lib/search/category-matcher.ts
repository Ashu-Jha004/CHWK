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
    const queryWords = normalizedQuery.split(" ");

    // Early return for empty query
    if (!normalizedQuery || queryWords.length === 0) {
      console.log("[matchCategories] Empty query, returning empty results");
      return [];
    }

    // Fetch all active categories with searchKeywords
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        searchKeywords: true,
      },
    });

    const matches: CategoryMatch[] = [];

    // Score each category
    for (const category of categories) {
      let maxScore = 0;
      let matchedKeyword: string | undefined;

      // Check category name match
      const nameScore = calculateSimilarity(normalizedQuery, category.name);
      if (nameScore > maxScore) {
        maxScore = nameScore;
        matchedKeyword = category.name;
      }

      // Check searchKeywords matches
      if (category.searchKeywords && category.searchKeywords.length > 0) {
        for (const keyword of category.searchKeywords) {
          const keywordNormalized = normalizeSearchTerm(keyword);

          // Exact match gets highest score
          if (keywordNormalized === normalizedQuery) {
            maxScore = 100;
            matchedKeyword = keyword;
            break;
          }

          // Check if query contains keyword or vice versa
          if (normalizedQuery.includes(keywordNormalized)) {
            const score = 90;
            if (score > maxScore) {
              maxScore = score;
              matchedKeyword = keyword;
            }
          } else if (keywordNormalized.includes(normalizedQuery)) {
            const score = 85;
            if (score > maxScore) {
              maxScore = score;
              matchedKeyword = keyword;
            }
          }

          // Word-level matching
          for (const queryWord of queryWords) {
            if (queryWord.length > 2 && keywordNormalized.includes(queryWord)) {
              const score = 70;
              if (score > maxScore) {
                maxScore = score;
                matchedKeyword = keyword;
              }
            }
          }

          // Similarity-based matching
          const similarity = calculateSimilarity(normalizedQuery, keyword);
          if (similarity > maxScore && similarity >= 60) {
            maxScore = similarity;
            matchedKeyword = keyword;
          }
        }
      }

      // Only include categories with meaningful matches
      if (maxScore >= 50) {
        matches.push({
          id: category.id,
          slug: category.slug,
          name: category.name,
          matchScore: maxScore,
          matchedKeyword,
        });
      }
    }

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Limit results
    const topMatches = matches.slice(0, limit);

    const timeTaken = Date.now() - startTime;
    console.log(
      `[matchCategories] Query: "${query}" | Matches: ${topMatches.length} | Time: ${timeTaken}ms`
    );

    return topMatches;
  } catch (error) {
    console.error("[matchCategories] Error matching categories:", error);
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
