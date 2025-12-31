// components/search/search-header.tsx
// Search header with results count and sort dropdown

"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, SlidersHorizontal } from "lucide-react";

interface SearchHeaderProps {
  query: string;
  totalResults: number;
  location?: string;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export function SearchHeader({
  query,
  totalResults,
  location,
  sortBy,
  onSortChange,
}: SearchHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
      {/* Search Info */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {query ? (
            <>
              Results for <span className="text-primary">{query}</span>
            </>
          ) : (
            "Search Results"
          )}
        </h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <span>{totalResults.toLocaleString()} businesses found</span>
          {location && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>in {location}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Most Relevant</SelectItem>
            <SelectItem value="distance">Nearest First</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="reviews">Most Reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
