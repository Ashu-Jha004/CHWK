/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SearchResponse } from "@/types/search/types";
import { FilterSidebar } from "./filter-sidebar";
import { BusinessGrid } from "./business-grid";
import { SearchHeader } from "./search-header";
import { EmptySearchState } from "./empty-search-state";
import { SpellCorrectionBanner } from "./spell-correction-banner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useBusinessSearch } from "@/hooks/search/use-business-search";

interface SearchResultsClientProps {
  initialData: SearchResponse;
  searchParams: Record<string, string | undefined>;
}

export function SearchResultsClient({
  initialData,
  searchParams,
}: SearchResultsClientProps) {
  const router = useRouter();

  // 1. INTEGRATE SMART SEARCH HOOK
  // We use the hook to handle all subsequent data fetching/caching
  // The 'initialData' is used as 'placeholderData' for a seamless transition
  const { data, isLoading, isPlaceholderData } = useBusinessSearch(
    searchParams.q || "",
    searchParams.location || ""
  );

  // Use current data if available, otherwise fall back to server-side initialData
  const currentData = data || initialData;

  const handleFilterChange = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams();

      Object.entries(searchParams).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      if (key !== "page") {
        params.set("page", "1");
      }

      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleLoadMore = useCallback(() => {
    if (!currentData.pagination.hasMore) return;

    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });

    const nextPage = (currentData.pagination.page + 1).toString();
    params.set("page", nextPage);

    router.push(`/search?${params.toString()}`);
  }, [currentData, router, searchParams]);

  const handleSortChange = useCallback(
    (sortBy: string) => {
      handleFilterChange("sort", sortBy);
    },
    [handleFilterChange]
  );

  // 2. EMPTY STATE HANDLING (With Smart Logic)
  if (currentData.results.length === 0 && !isLoading) {
    return (
      <EmptySearchState
        query={searchParams.q || ""}
        location={searchParams.location}
        suggestions={currentData.suggestions}
        onExpandRadius={() => {
          const currentRadius = parseInt(searchParams.radius || "10");
          const newRadius = currentRadius < 10 ? 15 : 25;
          handleFilterChange("radius", newRadius.toString());
        }}
      />
    );
  }

  return (
    <div className={isPlaceholderData || isLoading ? "opacity-60 transition-opacity" : "opacity-100"}>
      <div className="space-y-6">
      {/* Show spell correction banner if suggestion exists */}
      {currentData.suggestions?.didYouMean && currentData.results.length === 0 && (
        <SpellCorrectionBanner
          originalQuery={searchParams.q || ""}
          suggestedQuery={currentData.suggestions.didYouMean}
        />
      )}

      <SearchHeader
  query={searchParams.q || ""}
  // Add optional chaining here to prevent the 'total' of undefined error
  totalResults={currentData?.pagination?.total || 0}
  location={searchParams.location}
  sortBy={searchParams.sort || "relevance"}
  onSortChange={handleSortChange}
/>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <FilterSidebar
                currentFilters={{
                  radius: parseInt(searchParams.radius || "10"),
                  minRating: parseFloat(searchParams.minRating || "0") || undefined,
                  priceRange: searchParams.priceRange?.split(",") as any,
                  verified: searchParams.verified === "true",
                  category: searchParams.category,
                }}
                onFilterChange={handleFilterChange}
                availableCategories={
                  currentData.filters?.availableFilters?.categories || []
                }
              />
            </div>
          </aside>

          <main className="lg:col-span-3 space-y-6">
            {/* Show loader only during hard refresh or initial fetch */}
            {isLoading && !isPlaceholderData ? (
               <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
            ) : (
              <BusinessGrid businesses={currentData.results} />
            )}

            {currentData.pagination.hasMore && (
              <div className="flex justify-center pt-6">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  size="lg"
                  variant="outline"
                  className="min-w-[200px]"
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</>
                  ) : (
                    <>Load More ({currentData.pagination.total - currentData.results.length} remaining)</>
                  )}
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              Showing {currentData.results.length} of {currentData.pagination.total} results
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}