"use client";

import { useState, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { X, Filter } from "lucide-react";

interface FilterSidebarProps {
  currentFilters: {
    radius?: number;
    minRating?: number;
    priceRange?: string[];
    verified?: boolean;
    category?: string;
  };
  onFilterChange: (key: string, value: string | undefined) => void;
  availableCategories?: Array<{ slug: string; name: string; count: number }>;
  className?: string;
}

const PRICE_RANGES = [
  { value: "BUDGET", label: "Budget", symbol: "₹" },
  { value: "MODERATE", label: "Moderate", symbol: "₹₹" },
  { value: "EXPENSIVE", label: "Expensive", symbol: "₹₹₹" },
  { value: "LUXURY", label: "Luxury", symbol: "₹₹₹₹" },
];

const RATINGS = [4.5, 4.0, 3.5, 3.0];

export function FilterSidebar({
  currentFilters,
  onFilterChange,
  availableCategories = [],
  className,
}: FilterSidebarProps) {
  const [radius, setRadius] = useState(currentFilters.radius || 10);

  const handlePriceToggle = (range: string) => {
    const current = currentFilters.priceRange || [];
    const updated = current.includes(range)
      ? current.filter((r) => r !== range)
      : [...current, range];
    onFilterChange("priceRange", updated.length ? updated.join(",") : undefined);
  };

  const hasActiveFilters =
    (currentFilters.radius && currentFilters.radius !== 10) ||
    currentFilters.minRating ||
    (currentFilters.priceRange?.length || 0) > 0 ||
    currentFilters.verified ||
    currentFilters.category;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filters
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setRadius(10);
              onFilterChange("radius", "10");
              onFilterChange("minRating", undefined);
              onFilterChange("priceRange", undefined);
              onFilterChange("verified", undefined);
              onFilterChange("category", undefined);
            }}
            className="text-xs text-muted-foreground hover:text-foreground h-auto p-0"
          >
            Clear all
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["categories", "distance", "price", "rating", "trust"]}>

        {/* Categories */}
        {availableCategories.length > 0 && (
          <AccordionItem value="categories">
            <AccordionTrigger className="text-sm font-medium">Categories</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-40 pr-3">
                <div className="space-y-2">
                  {availableCategories.map((cat) => (
                    <div key={cat.slug} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.slug}`}
                        checked={currentFilters.category === cat.slug}
                        onCheckedChange={(checked) =>
                          onFilterChange("category", checked ? cat.slug : undefined)
                        }
                      />
                      <div className="flex-1 flex justify-between items-center text-sm">
                        <Label htmlFor={`cat-${cat.slug}`} className="cursor-pointer font-normal">
                          {cat.name}
                        </Label>
                        <span className="text-xs text-muted-foreground">{cat.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Distance */}
        <AccordionItem value="distance">
          <AccordionTrigger className="text-sm font-medium">Distance</AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-4">
              <div className="flex justify-between text-xs">
                <span>Within {radius} km</span>
              </div>
              <Slider
                value={[radius]}
                onValueChange={([val]) => setRadius(val)}
                onValueCommit={([val]) => onFilterChange("radius", val.toString())}
                max={50}
                step={1}
                min={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1km</span>
                <span>50km</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {PRICE_RANGES.map((range) => (
                <div key={range.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`price-${range.value}`}
                    checked={currentFilters.priceRange?.includes(range.value)}
                    onCheckedChange={() => handlePriceToggle(range.value)}
                  />
                  <Label htmlFor={`price-${range.value}`} className="flex-1 text-sm font-normal cursor-pointer flex justify-between">
                    <span>{range.label}</span>
                    <span className="text-muted-foreground">{range.symbol}</span>
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating */}
        <AccordionItem value="rating">
          <AccordionTrigger className="text-sm font-medium">Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {RATINGS.map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                   <Checkbox
                    id={`rating-${rating}`}
                    checked={currentFilters.minRating === rating}
                    onCheckedChange={(checked) =>
                      onFilterChange("minRating", checked ? rating.toString() : undefined)
                    }
                  />
                  <Label htmlFor={`rating-${rating}`} className="text-sm font-normal cursor-pointer">
                    {rating}+ Stars
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

         {/* Trust/Verification */}
         <AccordionItem value="trust">
          <AccordionTrigger className="text-sm font-medium">Trust & Safety</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified-only"
                checked={currentFilters.verified}
                onCheckedChange={(checked) =>
                  onFilterChange("verified", checked ? "true" : undefined)
                }
              />
              <Label htmlFor="verified-only" className="text-sm font-normal cursor-pointer">
                Verified Businesses Only
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
