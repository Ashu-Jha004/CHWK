/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/search/utils.ts
// Core utility functions for search engine

import {
  SearchParams,
  ParsedQuery,
  QueryQualifier,
  LocationIntent,
  Coordinates,
} from "@/types/search/types";

/**
 * Query qualifiers mapping
 * Maps common search terms to their filter intentions
 */
const QUALIFIER_PATTERNS = {
  rating: {
    top: { minRating: 4.5, sort: "rating" },
    best: { minRating: 4.0, sort: "reviews" }, // Best = rating + review count
    "highly rated": { minRating: 4.5, sort: "rating" },
    excellent: { minRating: 4.5, sort: "rating" },
    "top rated": { minRating: 4.5, sort: "rating" },
  },
  price: {
    cheap: ["BUDGET"],
    affordable: ["BUDGET", "MODERATE"],
    budget: ["BUDGET"],
    expensive: ["EXPENSIVE", "LUXURY"],
    luxury: ["LUXURY"],
    premium: ["EXPENSIVE", "LUXURY"],
  },
  distance: {
    nearby: { radius: 3 },
    "near me": { radius: 5 },
    close: { radius: 3 },
    around: { radius: 10 },
  },
} as const;

/**
 * Location keywords to detect "near me" intent
 */
const LOCATION_KEYWORDS = [
  "near me",
  "nearby",
  "close to me",
  "around me",
  "in my area",
  "closest",
];

/**
 * Stop words to remove from search query
 */
const STOP_WORDS = [
  "a",
  "an",
  "the",
  "in",
  "at",
  "on",
  "for",
  "to",
  "of",
  "with",
  "best",
  "top",
  "good",
  "great",
  "find",
  "search",
  "looking",
];

/**
 * Parse user search query to extract intent and qualifiers
 * @param query - Raw user input (e.g., "top italian restaurants near me")
 * @returns Parsed query with extracted components
 */
export function parseSearchQuery(query: string): ParsedQuery {
  try {
    const lowerQuery = query.toLowerCase().trim();
    const qualifiers: any[] = [];
    let cleanQuery = lowerQuery;
    let locationIntent: LocationIntent = { type: "none" };

    // 1. Extract location intent
    for (const keyword of LOCATION_KEYWORDS) {
      if (lowerQuery.includes(keyword)) {
        locationIntent = { type: "nearme" };
        cleanQuery = cleanQuery.replace(keyword, "").trim();
        break;
      }
    }

    // 2. Extract rating qualifiers
    for (const [keyword, config] of Object.entries(QUALIFIER_PATTERNS.rating)) {
      if (lowerQuery.includes(keyword)) {
        qualifiers.push({
          type: "rating",
          value: keyword,
          filterValue: config.minRating,
        });
        cleanQuery = cleanQuery.replace(keyword, "").trim();
        break; // Only one rating qualifier
      }
    }

    // 3. Extract price qualifiers
    for (const [keyword, priceRanges] of Object.entries(
      QUALIFIER_PATTERNS.price
    )) {
      if (lowerQuery.includes(keyword)) {
        qualifiers.push({
          type: "price",
          value: keyword,
          filterValue: priceRanges,
        });
        cleanQuery = cleanQuery.replace(keyword, "").trim();
        break; // Only one price qualifier
      }
    }

    // 4. Extract distance qualifiers
    for (const [keyword, config] of Object.entries(
      QUALIFIER_PATTERNS.distance
    )) {
      if (lowerQuery.includes(keyword) && keyword !== "near me") {
        // Skip "near me" (already handled)
        qualifiers.push({
          type: "distance",
          value: keyword,
          filterValue: config.radius,
        });
        cleanQuery = cleanQuery.replace(keyword, "").trim();
        break;
      }
    }

    // 5. Remove stop words
    const words = cleanQuery
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.includes(word));

    // 6. Extract intent (main search terms)
    const intent = words;

    // 7. Clean up extra spaces
    cleanQuery = words.join(" ");

    return {
      cleanQuery,
      intent,
      qualifiers,
      locationIntent,
    };
  } catch (error) {
    console.error("[parseSearchQuery] Error parsing query:", error);
    // Fallback: return original query as-is
    return {
      cleanQuery: query.trim(),
      intent: query.toLowerCase().split(/\s+/),
      qualifiers: [],
      locationIntent: { type: "none" },
    };
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 - First coordinate (user location)
 * @param coord2 - Second coordinate (business location)
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  try {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(coord2.latitude - coord1.latitude);
    const dLon = toRadians(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(coord1.latitude)) *
        Math.cos(toRadians(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    console.error("[calculateDistance] Error calculating distance:", error);
    return 0;
  }
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Normalize search term for fuzzy matching
 * Removes special characters, extra spaces, and lowercases
 */
export function normalizeSearchTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove special chars
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
}

/**
 * Calculate similarity score between two strings (0-100)
 * Uses simple character-based similarity
 */
export function calculateSimilarity(str1: string, str2: string): number {
  try {
    const s1 = normalizeSearchTerm(str1);
    const s2 = normalizeSearchTerm(str2);

    // Exact match
    if (s1 === s2) return 100;

    // Contains match
    if (s1.includes(s2) || s2.includes(s1)) return 80;

    // Word-level matching
    const words1 = s1.split(" ");
    const words2 = s2.split(" ");
    let matchCount = 0;

    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
          matchCount++;
          break;
        }
      }
    }

    const similarity =
      (matchCount / Math.max(words1.length, words2.length)) * 60;
    return Math.round(similarity);
  } catch (error) {
    console.error("[calculateSimilarity] Error:", error);
    return 0;
  }
}

/**
 * Build full-text search query for PostgreSQL
 * Creates a pattern for ILIKE search with trigrams
 */
export function buildSearchPattern(term: string): string {
  const normalized = normalizeSearchTerm(term);
  return `%${normalized}%`;
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat?: number, lon?: number): boolean {
  if (lat === undefined || lon === undefined) return false;
  return (
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180 &&
    !isNaN(lat) &&
    !isNaN(lon)
  );
}

/**
 * Sanitize search input to prevent SQL injection
 * (Prisma handles this, but extra safety layer)
 */
export function sanitizeSearchInput(input: string): string {
  return input
    .trim()
    .slice(0, 200) // Max length
    .replace(/[<>]/g, ""); // Remove potential XSS chars
}

/**
 * Generate unique search query ID for analytics
 */
export function generateQueryId(): string {
  return `sq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format distance for display
 * @param distance - Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km", "850 m")
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Extract city name from location string
 * Handles formats like: "Delhi", "New Delhi, Delhi", "Connaught Place, Delhi"
 */
export function extractCityName(location: string): string {
  try {
    const parts = location.split(",").map((p) => p.trim());
    // Last part is usually the city/state
    return parts[parts.length - 1] || parts[0];
  } catch (error) {
    console.error("[extractCityName] Error:", error);
    return location;
  }
}

/**
 * Check if search should trigger "expand radius" suggestion
 */
export function shouldSuggestExpandRadius(
  resultCount: number,
  currentRadius: number
): boolean {
  return resultCount < 5 && currentRadius < 25;
}

/**
 * Get suggested expanded radius
 */
export function getSuggestedRadius(currentRadius: number): number {
  if (currentRadius < 5) return 10;
  if (currentRadius < 10) return 15;
  if (currentRadius < 15) return 25;
  return 50;
}
