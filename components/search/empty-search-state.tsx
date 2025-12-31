// components/search/empty-search-state.tsx
// Empty state when no search results found

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SearchX,
  MapPin,
  TrendingUp,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

interface EmptySearchStateProps {
  query: string;
  location?: string;
  suggestions?: {
    expandRadius?: boolean;
    relatedSearches?: string[];
  };
  onExpandRadius?: () => void;
}

export function EmptySearchState({
  query,
  location,
  suggestions,
  onExpandRadius,
}: EmptySearchStateProps) {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <Card className="border-dashed">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <SearchX className="h-10 w-10 text-gray-400" />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              No Results Found
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {query ? (
                <>
                  We couldn&apos;t find any businesses matching
                  <span className="font-semibold text-foreground">{query}</span>
                  {location && (
                    <>
                      {" "}
                      in{" "}
                      <span className="font-semibold text-foreground">
                        {location}
                      </span>
                    </>
                  )}
                </>
              ) : (
                "Try adjusting your search criteria or filters"
              )}
            </p>
          </div>

          {/* Suggestions */}
          <div className="space-y-4">
            {/* Expand Radius */}
            {suggestions?.expandRadius && onExpandRadius && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-blue-900 mb-1">
                      Expand Your Search Area
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Try searching in a wider radius to find more businesses
                      nearby
                    </p>
                    <Button
                      onClick={onExpandRadius}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Search Wider Area
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Related Searches */}
            {suggestions?.relatedSearches &&
              suggestions.relatedSearches.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-amber-900 mb-2">
                        Try These Categories
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.relatedSearches.map((search) => (
                          <Link
                            key={search}
                            href={`/search?q=${encodeURIComponent(search)}${
                              location
                                ? `&location=${encodeURIComponent(location)}`
                                : ""
                            }`}
                          >
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-amber-100 transition-colors border-amber-300"
                            >
                              {search}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Tips */}
          <div className="border-t pt-6 mt-6">
            <div className="flex items-start gap-3 text-left max-w-md mx-auto">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Search Tips:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Try using different keywords or spellings</li>
                  <li>• Remove filters to see more results</li>
                  <li>
                    • Search for broader categories
                    {` (e.g., "food" instead of
                    "italian pizza")`}
                  </li>
                  <li>• Check if your location is correct</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link href="/categories">
              <Button variant="outline" size="lg">
                Browse Categories
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg">Back to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
