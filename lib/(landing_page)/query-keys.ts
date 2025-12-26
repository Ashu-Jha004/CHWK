import { QueryClient } from "@tanstack/react-query";

/**
 * Centralized Query Keys for React Query
 * Helps with cache invalidation and organization
 * Follow consistent naming convention for easy maintenance
 */
export const queryKeys = {
  // Business queries
  businesses: {
    all: ["businesses"] as const,
    lists: () => [...queryKeys.businesses.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.businesses.lists(), filters] as const,
    details: () => [...queryKeys.businesses.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.businesses.details(), id] as const,
    search: (query: string, location: string) =>
      [...queryKeys.businesses.all, "search", query, location] as const,
    category: (category: string) =>
      [...queryKeys.businesses.all, "category", category] as const,
    featured: () => [...queryKeys.businesses.all, "featured"] as const,
    trending: () => [...queryKeys.businesses.all, "trending"] as const,
  },

  // Review queries
  reviews: {
    all: ["reviews"] as const,
    lists: () => [...queryKeys.reviews.all, "list"] as const,
    list: (businessId: string) =>
      [...queryKeys.reviews.lists(), businessId] as const,
    detail: (reviewId: string) =>
      [...queryKeys.reviews.all, "detail", reviewId] as const,
  },

  // Category queries
  categories: {
    all: ["categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
    popular: () => [...queryKeys.categories.all, "popular"] as const,
  },

  // User queries
  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    favorites: () => [...queryKeys.user.all, "favorites"] as const,
    reviews: () => [...queryKeys.user.all, "reviews"] as const,
  },

  // Location queries
  locations: {
    all: ["locations"] as const,
    cities: () => [...queryKeys.locations.all, "cities"] as const,
    nearby: (lat: number, lng: number) =>
      [...queryKeys.locations.all, "nearby", lat, lng] as const,
  },

  // Stats queries
  stats: {
    all: ["stats"] as const,
    global: () => [...queryKeys.stats.all, "global"] as const,
  },
} as const;

/**
 * Type-safe query key factory
 * Ensures consistency across the application
 */
export type QueryKeys = typeof queryKeys;

/**
 * Helper to invalidate related queries
 * Example usage: invalidateQueriesHelper(queryClient, 'businesses')
 */
export const invalidateQueriesHelper = {
  businesses: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all }),
  reviews: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all }),
  user: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.user.all }),
};
