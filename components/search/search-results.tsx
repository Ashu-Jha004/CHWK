/* eslint-disable @typescript-eslint/no-explicit-any */
// components/search/search-results-client.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchResponse } from "@/types/search/types";
import { SearchFilters } from "./search-filters";
import { BusinessGrid } from "./business-grid";
import { SearchHeader } from "./search-header";
import { EmptySearchState } from "./empty-search-state";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SearchResultsClientProps {
  initialData: SearchResponse;
  searchParams: Record<string, string | undefined>;
}

export function SearchResultsClient({
  initialData,
  searchParams,
}: SearchResultsClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // components/search/search-results.tsx
  // Verify the handleFilterChange function exists:

  const handleFilterChange = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams();

      // Copy all existing params
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });

      // Update the changed param
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Reset to page 1 when filters change
      if (key !== "page") {
        params.set("page", "1");
      }

      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!initialData.pagination.hasMore) return;

    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });

    const nextPage = (initialData.pagination.page + 1).toString();
    params.set("page", nextPage);

    router.push(`/search?${params.toString()}`);
  }, [initialData, router, searchParams]);

  // Handle sort change
  const handleSortChange = useCallback(
    (sortBy: string) => {
      handleFilterChange("sort", sortBy);
    },
    [handleFilterChange]
  );

  // Empty results
  if (initialData.results.length === 0) {
    return (
      <EmptySearchState
        query={searchParams.q || ""}
        location={searchParams.location}
        suggestions={initialData.suggestions}
        onExpandRadius={() => {
          const currentRadius = parseInt(searchParams.radius || "10");
          const newRadius = currentRadius < 10 ? 15 : 25;
          handleFilterChange("radius", newRadius.toString());
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <SearchHeader
        query={searchParams.q || ""}
        totalResults={initialData.pagination.total}
        location={searchParams.location}
        sortBy={searchParams.sort || "relevance"}
        onSortChange={handleSortChange}
      />

      {/* Main Content: Filters + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <SearchFilters
            currentFilters={{
              radius: parseInt(searchParams.radius || "10"),
              minRating: parseFloat(searchParams.minRating || "0") || undefined,
              priceRange: searchParams.priceRange?.split(",") as any,
              verified: searchParams.verified === "true",
            }}
            onFilterChange={handleFilterChange}
            availableCategories={
              initialData.filters.availableFilters.categories
            }
          />
        </aside>

        {/* Results Grid */}
        <main className="lg:col-span-3 space-y-6">
          <BusinessGrid businesses={initialData.results} />

          {/* Load More Button */}
          {initialData.pagination.hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                size="lg"
                variant="outline"
                className="min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More (
                    {initialData.pagination.total - initialData.results.length}{" "}
                    remaining)
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Pagination Info */}
          <div className="text-center text-sm text-muted-foreground">
            Showing {initialData.results.length} of{" "}
            {initialData.pagination.total} results
            {initialData.metadata.searchTime && (
              <span className="ml-2">
                ({initialData.metadata.searchTime}ms)
              </span>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
