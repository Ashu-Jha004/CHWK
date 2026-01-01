import { useQuery } from "@tanstack/react-query";
import { getSearchSuggestions } from "@/app/(customer)/(public)/action/autocomplete";
import { useDebounce } from "../use-debounce"; // Ensure you have a simple debounce hook

export function useAutocomplete(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ["autocomplete", debouncedQuery],
    queryFn: () => getSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
  });
}