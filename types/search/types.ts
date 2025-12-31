// lib/search/types.ts
// Type definitions for search functionality

import { PriceRange } from "@prisma/client";

/**
 * Search query parameters from user input
 */
export interface SearchParams {
  query: string; // User's search term
  location?: string; // City name or "near me"
  latitude?: number; // GPS latitude
  longitude?: number; // GPS longitude
  radius?: number; // Search radius in km (default: 10)

  // Filters
  categorySlug?: string; // Filter by category
  priceRange?: PriceRange[]; // Filter by price range
  minRating?: number; // Minimum rating (e.g., 4.0)
  isVerified?: boolean; // Only verified businesses
  isOpen?: boolean; // Only currently open businesses

  // Pagination
  page?: number; // Page number (default: 1)
  limit?: number; // Results per page (default: 12)

  // Sorting
  sortBy?: "relevance" | "distance" | "rating" | "reviews";
}

/**
 * Parsed search query with extracted intent
 */
export interface ParsedQuery {
  cleanQuery: string; // Query without qualifiers
  intent: string[]; // Main search terms (e.g., ["italian", "restaurant"])
  qualifiers: QueryQualifier[]; // Extracted qualifiers (top, best, cheap)
  locationIntent: LocationIntent; // "near me" vs specific location
}

/**
 * Query qualifiers extracted from search terms
 */
export interface QueryQualifier {
  type: "rating" | "price" | "distance" | "popularity";
  value: string; // "top", "best", "cheap", "nearby"
  filterValue?: number | string | string[]; // Translated filter value (supports arrays for price ranges)
}

/**
 * Location intent from query
 */
export interface LocationIntent {
  type: "nearme" | "specific" | "none";
  value?: string; // City name if specific
}

/**
 * Matched categories from search query
 */
export interface CategoryMatch {
  id: string;
  slug: string;
  name: string;
  matchScore: number; // 0-100 relevance score
  matchedKeyword?: string; // Which keyword matched
}

/**
 * Business search result with distance
 */
export interface BusinessSearchResult {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  logo: string | null;
  coverImage: string | null;

  // Location
  city: string;
  area: string | null;
  pincode: string;
  latitude: number;
  longitude: number;
  distance?: number; // Distance in km (if location-based search)

  // Business details
  averageRating: number | null;
  totalReviews: number;
  priceRange: PriceRange | null;
  isVerified: boolean;

  // Categories
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    isPrimary: boolean;
  }>;

  // Availability
  isOpen?: boolean; // Calculated based on current time
  nextOpenTime?: string; // If closed, when it opens
}

/**
 * Search response with results and metadata
 */
export interface SearchResponse {
  results: BusinessSearchResult[];
  pagination: {
    total: number; // Total results found
    page: number; // Current page
    limit: number; // Results per page
    totalPages: number; // Total pages
    hasMore: boolean; // Has next page
  };
  filters: {
    appliedFilters: Partial<SearchParams>;
    availableFilters: {
      categories: Array<{ slug: string; name: string; count: number }>;
      priceRanges: Array<{ range: PriceRange; count: number }>;
      cities: Array<{ city: string; count: number }>;
    };
  };
  suggestions?: {
    didYouMean?: string; // Spelling correction suggestion
    relatedSearches?: string[]; // Related search terms
    expandRadius?: boolean; // Suggest expanding search radius
  };
  metadata: {
    searchTime: number; // Query execution time in ms
    queryId: string; // For analytics tracking
  };
}

/**
 * Coordinates for location-based search
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Distance calculation result
 */
export interface DistanceResult {
  businessId: string;
  distance: number; // Distance in km
}
