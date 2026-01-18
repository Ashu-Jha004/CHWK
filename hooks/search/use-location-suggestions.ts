// Hook for location autocomplete suggestions
// Fetches location suggestions from API as user types

"use client";

import { useState, useEffect } from "react";
import { debounce } from "@/lib/search/utils";

export interface LocationSuggestion {
  type: "city" | "area" | "pincode";
  value: string;
  label: string;
  metadata: {
    type: string;
  };
}

export function useLocationSuggestions(query: string, enabled: boolean = true) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = debounce(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/search/locations?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch suggestions");
        }

        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("[Location Suggestions] Error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    fetchSuggestions();
  }, [query, enabled]);

  return { suggestions, isLoading, error };
}
