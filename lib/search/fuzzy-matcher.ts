import { prisma } from "@/lib/prisma";

/**
 * Find similar terms in categories and businesses using PostgreSQL trigram similarity
 * This helps with typo correction and "Did you mean?" suggestions
 */
export async function findSimilarTerms(query: string, limit: number = 5) {
  if (!query || query.length < 3) return [];

  try {
    // Search in categories using similarity
    const similarCategories = await prisma.$queryRaw<Array<{
      name: string;
      similarity: number;
    }>>`
      SELECT
        name,
        similarity(name, ${query}) as similarity
      FROM categories
      WHERE
        "isActive" = true
        AND similarity(name, ${query}) > 0.3
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;

    // Search in business names using similarity
    const similarBusinessNames = await prisma.$queryRaw<Array<{
      name: string;
      similarity: number;
    }>>`
      SELECT DISTINCT
        name,
        similarity(name, ${query}) as similarity
      FROM businesses
      WHERE
        status IN ('ACTIVE', 'CLAIMED')
        AND similarity(name, ${query}) > 0.3
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;

    // Combine and deduplicate
    const allSuggestions = [
      ...similarCategories.map(c => ({ term: c.name, score: Number(c.similarity) })),
      ...similarBusinessNames.map(b => ({ term: b.name, score: Number(b.similarity) }))
    ];

    // Sort by score and remove duplicates
    const uniqueSuggestions = Array.from(
      new Map(allSuggestions.map(s => [s.term.toLowerCase(), s])).values()
    )
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return uniqueSuggestions;
  } catch (error) {
    console.error("[findSimilarTerms] Error:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Get the best spell correction suggestion
 */
export async function getSpellingSuggestion(query: string): Promise<string | null> {
  const suggestions = await findSimilarTerms(query, 1);

  // Only return if similarity is high enough (likely a typo)
  if (suggestions.length > 0 && suggestions[0].score > 0.5) {
    return suggestions[0].term;
  }

  return null;
}

/**
 * Perform fuzzy search on businesses with typo tolerance
 */
export async function fuzzySearchBusinesses(
  query: string,
  limit: number = 20
) {
  if (!query || query.length < 2) return [];

  try {
    const results = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      slug: string;
      city: string;
      similarity: number;
    }>>`
      SELECT
        id,
        name,
        slug,
        city,
        GREATEST(
          similarity(name, ${query}),
          similarity(description, ${query})
        ) as similarity
      FROM businesses
      WHERE
        status IN ('ACTIVE', 'CLAIMED')
        AND "deletedAt" IS NULL
        AND (
          name % ${query}
          OR description % ${query}
        )
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;

    return results.map(r => ({
      ...r,
      similarity: Number(r.similarity)
    }));
  } catch (error) {
    console.error("[fuzzySearchBusinesses] Error:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Check if PostgreSQL extensions are enabled
 */
export async function checkFuzzySearchExtensions() {
  try {
    const extensions = await prisma.$queryRaw<Array<{ extname: string }>>`
      SELECT extname FROM pg_extension WHERE extname IN ('pg_trgm', 'fuzzystrmatch')
    `;

    const hasPgTrgm = extensions.some(e => e.extname === 'pg_trgm');
    const hasFuzzystrmatch = extensions.some(e => e.extname === 'fuzzystrmatch');

    return {
      pg_trgm: hasPgTrgm,
      fuzzystrmatch: hasFuzzystrmatch,
      allEnabled: hasPgTrgm && hasFuzzystrmatch
    };
  } catch (error) {
    console.error("[checkFuzzySearchExtensions] Error:", error);
    return {
      pg_trgm: false,
      fuzzystrmatch: false,
      allEnabled: false
    };
  }
}
