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
import { MapPin, SlidersHorizontal, LayoutGrid, Map as MapIcon, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterSidebar } from "./filter-sidebar";
import { useState } from "react";

interface SearchHeaderProps {
  query: string;
  totalResults: number;
  location?: string;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  view: "list" | "map";
  onViewChange: (view: "list" | "map") => void;
  // Props for Mobile Filters
  currentFilters: {
    radius?: number;
    minRating?: number;
    priceRange?: string[];
    verified?: boolean;
    category?: string;
  };
  onFilterChange: (key: string, value: string | undefined) => void;
  availableCategories?: Array<{ slug: string; name: string; count: number }>;
}

export function SearchHeader({
  query,
  totalResults,
  location,
  sortBy,
  onSortChange,
  view,
  onViewChange,
  currentFilters,
  onFilterChange,
  availableCategories,
}: SearchHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 pb-4 border-b">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        {/* Desktop View Switcher & Sort */}
        <div className="hidden lg:flex items-center gap-4">
           {/* View Switcher */}
           <Tabs value={view} onValueChange={(v) => onViewChange(v as "list" | "map")}>
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="list" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2">
                <MapIcon className="h-4 w-4" />
                Map
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
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
      </div>

       {/* Mobile Controls (Visible only on mobile/tablet) */}
       <div className="flex lg:hidden items-center justify-between gap-2 overflow-x-auto pb-1">
          {/* Mobile Filter Sheet */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 flex-1">
                <Filter className="h-4 w-4" />
                Filters
                {(currentFilters.radius !== 10 || currentFilters.minRating || currentFilters.priceRange || currentFilters.verified || currentFilters.category) && (
                   <span className="flex h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[540px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your search results
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar
                    currentFilters={currentFilters}
                    onFilterChange={onFilterChange}
                    availableCategories={availableCategories}
                 />
              </div>
              <div className="mt-6 flex justify-end">
                  <Button onClick={() => setIsFilterOpen(false)} className="w-full">
                      Show Results
                  </Button>
              </div>
            </SheetContent>
          </Sheet>

           {/* Mobile Sort */}
           <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="flex-1 h-9">
                 <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span className="text-sm">Sort</span>
                 </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="distance">Nearest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviewed</SelectItem>
              </SelectContent>
            </Select>

           {/* Mobile View Toggle */}
           <div className="flex rounded-md border bg-background p-1">
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => onViewChange("list")}
              >
                  <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "map" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => onViewChange("map")}
              >
                  <MapIcon className="h-4 w-4" />
              </Button>
           </div>
       </div>

    </div>
  );
}
