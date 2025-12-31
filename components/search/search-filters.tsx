// components/search/search-filters.tsx
// Filter sidebar with distance slider, rating, price, and verified toggle

"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, IndianRupee, CheckCircle2, X } from "lucide-react";
import { PriceRange } from "@prisma/client";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  currentFilters: {
    radius?: number;
    minRating?: number;
    priceRange?: PriceRange[];
    verified?: boolean;
  };
  onFilterChange: (key: string, value: string | undefined) => void;
  availableCategories?: Array<{ slug: string; name: string; count: number }>;
}

const PRICE_RANGES = [
  { value: "BUDGET", label: "Budget", symbol: "₹" },
  { value: "MODERATE", label: "Moderate", symbol: "₹₹" },
  { value: "EXPENSIVE", label: "Expensive", symbol: "₹₹₹" },
  { value: "LUXURY", label: "Luxury", symbol: "₹₹₹₹" },
];

const RATING_OPTIONS = [
  { value: 4.5, label: "4.5+ stars" },
  { value: 4.0, label: "4.0+ stars" },
  { value: 3.5, label: "3.5+ stars" },
  { value: 3.0, label: "3.0+ stars" },
];

export function SearchFilters({
  currentFilters,
  onFilterChange,
  availableCategories,
}: SearchFiltersProps) {
  const [radiusValue, setRadiusValue] = useState(currentFilters.radius || 10);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>(
    currentFilters.priceRange || []
  );

  // Handle distance slider change
  const handleRadiusChange = useCallback((value: number[]) => {
    const newRadius = value[0];
    setRadiusValue(newRadius);
  }, []);

  // Apply radius filter (on slider release)
  const handleRadiusCommit = useCallback(
    (value: number[]) => {
      onFilterChange("radius", value[0].toString());
    },
    [onFilterChange]
  );

  // Handle rating filter
  const handleRatingChange = useCallback(
    (rating: number) => {
      if (currentFilters.minRating === rating) {
        onFilterChange("minRating", undefined);
      } else {
        onFilterChange("minRating", rating.toString());
      }
    },
    [currentFilters.minRating, onFilterChange]
  );

  // Handle price range toggle
  const handlePriceRangeToggle = useCallback(
    (range: PriceRange) => {
      let newRanges: PriceRange[];

      if (selectedPriceRanges.includes(range)) {
        newRanges = selectedPriceRanges.filter((r) => r !== range);
      } else {
        newRanges = [...selectedPriceRanges, range];
      }

      setSelectedPriceRanges(newRanges);
      onFilterChange(
        "priceRange",
        newRanges.length > 0 ? newRanges.join(",") : undefined
      );
    },
    [selectedPriceRanges, onFilterChange]
  );

  // Handle verified toggle
  const handleVerifiedToggle = useCallback(() => {
    onFilterChange("verified", currentFilters.verified ? undefined : "true");
  }, [currentFilters.verified, onFilterChange]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setRadiusValue(10);
    setSelectedPriceRanges([]);
    onFilterChange("radius", "10");
    onFilterChange("minRating", undefined);
    onFilterChange("priceRange", undefined);
    onFilterChange("verified", undefined);
  }, [onFilterChange]);

  // Check if any filters are active
  const hasActiveFilters =
    (currentFilters.radius && currentFilters.radius !== 10) ||
    currentFilters.minRating ||
    (currentFilters.priceRange && currentFilters.priceRange.length > 0) ||
    currentFilters.verified;

  return (
    <div className="space-y-4">
      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          className="w-full"
        >
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}

      {/* Distance Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Distance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">
                Within {radiusValue} km
              </Label>
              <Badge variant="secondary">{radiusValue} km</Badge>
            </div>
            <Slider
              value={[radiusValue]}
              onValueChange={handleRadiusChange}
              onValueCommit={handleRadiusCommit}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Minimum Rating
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RATING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleRatingChange(option.value)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                "hover:bg-gray-100 border",
                currentFilters.minRating === option.value
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-transparent"
              )}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  currentFilters.minRating === option.value
                    ? "text-primary fill-primary"
                    : "text-gray-400"
                )}
              />
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Price Range Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-primary" />
            Price Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <label
              key={range.value}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all",
                "hover:bg-gray-100 border",
                selectedPriceRanges.includes(range.value as PriceRange)
                  ? "border-primary bg-primary/5"
                  : "border-transparent"
              )}
            >
              <Checkbox
                checked={selectedPriceRanges.includes(
                  range.value as PriceRange
                )}
                onCheckedChange={() =>
                  handlePriceRangeToggle(range.value as PriceRange)
                }
              />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm">{range.label}</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {range.symbol}
                </span>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Verified Only Toggle */}
      <Card>
        <CardContent className="pt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={currentFilters.verified || false}
              onCheckedChange={handleVerifiedToggle}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Verified Only</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Show only verified businesses
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Available Categories (if any) */}
      {availableCategories && availableCategories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Related Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {availableCategories.map((category) => (
              <Button
                key={category.slug}
                variant="ghost"
                size="sm"
                className="w-full justify-between text-left"
                onClick={() => onFilterChange("category", category.slug)}
              >
                <span className="text-sm">{category.name}</span>
                {category.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                )}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
