// hooks/search/use-search-suggestions.ts
// Custom hook for fetching search suggestions with debouncing

"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export interface SearchSuggestion {
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

interface UseSuggestionsResult {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch search suggestions based on user input
 * Features:
 * - Automatic debouncing (300ms)
 * - Loading state management
 * - Error handling
 * - Skips requests for short queries
 */
export function useSearchSuggestions(
  query: string,
  enabled: boolean = true
): UseSuggestionsResult {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 300);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, enabled, fetchSuggestions]);

  return { suggestions, isLoading, error };
}
