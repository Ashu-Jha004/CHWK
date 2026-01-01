// hooks/search/use-business-search.ts
import { useQuery } from "@tanstack/react-query";
import { searchBusinessesAction } from "@/app/(customer)/(public)/action/search";

/**
 * ADVANCED SEARCH HOOK
 * Optimizes performance with stale-time caching and prevents unnecessary server load.
 */
export function useBusinessSearch(query: string, city: string) {
  return useQuery({
    // Cache key: unique to the query string and the city selected
    queryKey: ["search", "businesses", query, city],

    queryFn: async () => {
      const response = await searchBusinessesAction({ query, city });

      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    },

    // Performance & UX Conditions
    enabled: query.length >= 2, // Only run if user typed at least 2 chars
    staleTime: 1000 * 60 * 5,    // Cache results for 5 minutes
    retry: 1,                   // Retry once on failure before showing error
    refetchOnWindowFocus: false // Don't reload results just because user switched tabs
  });
}