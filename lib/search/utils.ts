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

// Days mapping for Date.getDay() (0=Sunday) to Prisma DayOfWeek
const DAY_MAP = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export function isOpenNow(hours: any[]): boolean {
  if (!hours || hours.length === 0) return false;

  const now = new Date();
  // Convert to IST (Asia/Kolkata) for accurate local status
  const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  const currentDay = DAY_MAP[istTime.getDay()];
  const currentHour = istTime.getHours();
  const currentMinute = istTime.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;

  // Find today's hours
  const todayHours = hours.find(h => h.dayOfWeek === currentDay);

  if (!todayHours || todayHours.isClosed) return false;

  // Parse Open/Close times (e.g., "09:00", "22:00")
  const [openH, openM] = todayHours.openTime.split(":").map(Number);
  const [closeH, closeM] = todayHours.closeTime.split(":").map(Number);

  const openTimeVal = openH * 60 + openM;
  const closeTimeVal = closeH * 60 + closeM;

  // Handle crossing midnight? Assuming not for now unless business allows it
  if (closeTimeVal < openTimeVal) {
    // Late night closure (e.g. 11:00 AM to 02:00 AM)
    // If current time is after open OR before close
    return currentTimeVal >= openTimeVal || currentTimeVal <= closeTimeVal;
  }

  return currentTimeVal >= openTimeVal && currentTimeVal <= closeTimeVal;
}

/**
 * Query qualifiers mapping
 * Maps common search terms to their filter intentions
 */
export const ENHANCED_QUALIFIERS = {
  // Matches: "top rated", "best", "highly rated", "5 star"
  rating: {
    pattern: /(top[- ]rated|best|highly[- ]rated|excellent|5[- ]star)/gi,
    filter: { minRating: 4.5, sort: "rating" }
  },
  // Matches: "cheap", "budget", "affordable", "low cost"
  price_low: {
    pattern: /(cheap|budget|affordable|low[- ]cost|economical)/gi,
    filter: { priceRange: ["BUDGET"] }
  },
  // Matches: "luxury", "expensive", "premium", "high end"
  price_high: {
    pattern: /(luxury|expensive|premium|high[- ]end|fancy)/gi,
    filter: { priceRange: ["EXPENSIVE", "LUXURY"] }
  },
  // Matches: "open now", "available", "working"
  availability: {
    pattern: /(open[- ]now|available|working)/gi,
    filter: { openNow: true }
  },
  // Matches: "verified", "trusted", "certified"
  trust: {
    pattern: /(verified|trusted|certified|authentic)/gi,
    filter: { isVerified: true }
  }
};

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
export function parseSearchQuery(query: string): any {
  try {
    const lowerQuery = query.toLowerCase().trim();
    let cleanQuery = lowerQuery;
    const extractedFilters: any = {};

    // 1. Extract Location from Query (Smart Detection)
    const { cleanQuery: queryWithoutLocation, location: extractedLocation } = extractLocationFromQuery(query);

    // 2. Extract Location Intent (Near me / Nearby)
    const hasNearMe = /(near[- ]me|nearby|around[- ]me|close[- ]to[- ]me)/gi.test(lowerQuery);
    const locationIntent: LocationIntent = hasNearMe ? { type: "nearme" } : { type: "none" };

    // Use extracted query if we found a location
    if (extractedLocation) {
      cleanQuery = queryWithoutLocation.toLowerCase();
    }

    // Clean location keywords from the query
    cleanQuery = cleanQuery.replace(/(near[- ]me|nearby|around[- ]me|close[- ]to[- ]me)/gi, "").trim();

    // 3. Extract Semantic Qualifiers using Regex
    Object.entries(ENHANCED_QUALIFIERS).forEach(([key, config]) => {
      if (config.pattern.test(cleanQuery)) {
        Object.assign(extractedFilters, config.filter);
        cleanQuery = cleanQuery.replace(config.pattern, "").trim();
      }
    });

    // 4. Final Cleaning (Remove common filler words)
    cleanQuery = cleanQuery
      .replace(/^(looking[- ]for|find[- ]me|search[- ]for|i[- ]need|i[- ]want)/gi, "")
      .trim();

    return {
      cleanQuery: cleanQuery || lowerQuery, // Fallback to original if over-cleaned
      locationIntent,
      extractedLocation, // Include extracted location
      extractedFilters,
      rawQuery: query
    };
  } catch (error) {
    console.error("[Parser Error]: Failed to extract intent", { query, error });
    return {
      cleanQuery: query,
      locationIntent: { type: "none" },
      extractedLocation: null,
      extractedFilters: {},
      rawQuery: query
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

/**
 * Check if location string indicates "near me" intent
 * Returns true for phrases like "near me", "nearby", "around me", etc.
 */
export function isNearMeIntent(location?: string): boolean {
  if (!location) return false;
  return /(near\s+me|nearby|close\s+to\s+me|around\s+me|current\s+location|my\s+location)/i.test(location);
}

/**
 * Check if user provided a specific location (not "near me")
 * Returns true when user types a city/area name like "Bangalore", "Delhi", etc.
 */
export function isSpecificLocationIntent(location?: string): boolean {
  if (!location) return false;
  // Has location text AND it's NOT a "near me" phrase
  return location.trim().length > 0 && !isNearMeIntent(location);
}

/**
 * Extract location from search query
 * Handles patterns like:
 * - "restaurants in Bangalore" -> "Bangalore"
 * - "Bangalore restaurants" -> "Bangalore"
 * - "pizza near kormangala" -> "kormangala"
 * - "plumber in south delhi" -> "south delhi"
 */
export function extractLocationFromQuery(query: string): { cleanQuery: string; location: string | null } {
  try {
    const lowerQuery = query.toLowerCase().trim();

    // Pattern 1: "[something] in [location]"
    const inPattern = /(.+?)\s+in\s+([a-z\s]+?)(?:\s|$)/i;
    const inMatch = query.match(inPattern);
    if (inMatch) {
      const beforeIn = inMatch[1].trim();
      const location = inMatch[2].trim();
      // Only extract if location looks valid (2+ chars, not a common word)
      if (location.length >= 2 && !['me', 'my', 'the', 'this', 'that'].includes(location)) {
        return {
          cleanQuery: beforeIn,
          location: location
        };
      }
    }

    // Pattern 2: "[something] near [location]" (not "near me")
    const nearPattern = /(.+?)\s+near\s+([a-z\s]+?)(?:\s|$)/i;
    const nearMatch = query.match(nearPattern);
    if (nearMatch && !isNearMeIntent(nearMatch[2])) {
      const beforeNear = nearMatch[1].trim();
      const location = nearMatch[2].trim();
      if (location.length >= 2) {
        return {
          cleanQuery: beforeNear,
          location: location
        };
      }
    }

    // Pattern 3: "[location] [something]" - First word could be location
    // Only if first word is capitalized and looks like a city name
    const words = query.split(/\s+/);
    if (words.length >= 2 && /^[A-Z]/.test(words[0])) {
      // Check if first 1-3 words might be location
      for (let i = Math.min(3, words.length - 1); i >= 1; i--) {
        const potentialLocation = words.slice(0, i).join(' ');
        const remainingQuery = words.slice(i).join(' ');

        // Basic validation: location should be capitalized and > 3 chars
        if (potentialLocation.length >= 3 && /^[A-Z]/.test(potentialLocation) && remainingQuery.length >= 3) {
          // This is a heuristic - might need refinement
          // For now, we'll be conservative and not extract unless we're confident
          // You could add a city database check here
          break; // Don't extract in this case to avoid false positives
        }
      }
    }

    return { cleanQuery: query, location: null };
  } catch (error) {
    console.error('[extractLocationFromQuery] Error:', error);
    return { cleanQuery: query, location: null };
  }
}

/**
 * Common Indian cities for location validation/autocomplete
 * This can be expanded or loaded from database
 */
export const COMMON_INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Surat', 'Lucknow',
  'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam',
  'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
  'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi',
  'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai',
  'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
  'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur',
  'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad'
];

/**
 * Normalize location name for matching
 * Handles common variations like Bengaluru/Bangalore
 */
export function normalizeLocationName(location: string): string {
  const normalized = location.toLowerCase().trim();

  // Handle common variations
  const variations: Record<string, string> = {
    'bengaluru': 'bangalore',
    'mumbai': 'bombay',
    'kolkata': 'calcutta',
    'chennai': 'madras',
    'new delhi': 'delhi',
  };

  return variations[normalized] || normalized;
}

