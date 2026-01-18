// Enhanced search bar with separate location input and autocomplete
// Supports smart location detection and "near me" functionality

"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Locate, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocationSuggestions, LocationSuggestion } from "@/hooks/search/use-location-suggestions";
import { useRouter } from "next/navigation";

interface EnhancedSearchBarProps {
  initialQuery?: string;
  initialLocation?: string;
  onSearch?: (query: string, location?: string) => void;
  className?: string;
}

export function EnhancedSearchBar({
  initialQuery = "",
  initialLocation = "",
  onSearch,
  className,
}: EnhancedSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationContainerRef = useRef<HTMLDivElement>(null);

  // Fetch location suggestions
  const { suggestions, isLoading } = useLocationSuggestions(location, showLocationSuggestions);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationContainerRef.current &&
        !locationContainerRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user's current location
  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);

    if ("geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        setLocation("near me");
        setShowLocationSuggestions(false);
      } catch (error) {
        console.error("Error getting location:", error);
        // Fallback: still set to "near me" which will use GPS if available
        setLocation("near me");
      }
    } else {
      setLocation("near me");
    }

    setIsGettingLocation(false);
  };

  // Handle location suggestion selection
  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setLocation(suggestion.value);
    setShowLocationSuggestions(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation for location suggestions
  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showLocationSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleLocationSelect(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowLocationSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;

    if (onSearch) {
      onSearch(query, location || undefined);
    } else {
      // Build search URL with parameters
      const params = new URLSearchParams();
      params.set("q", query);
      if (location && location !== "near me") {
        params.set("location", location);
      }

      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Query Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search for businesses, services..."
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Location Input */}
        <div ref={locationContainerRef} className="relative md:w-80">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input
            ref={locationInputRef}
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowLocationSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowLocationSuggestions(true)}
            onKeyDown={handleLocationKeyDown}
            placeholder="City, area, or pincode"
            className="pl-10 pr-20 h-12 text-base"
          />

          {/* Clear and Current Location Buttons */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            {location && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setLocation("");
                  setShowLocationSuggestions(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              title="Use current location"
            >
              <Locate className={cn("h-4 w-4", isGettingLocation && "animate-pulse")} />
            </Button>
          </div>

          {/* Location Suggestions Dropdown */}
          {showLocationSuggestions && location.length >= 2 && (
            <div className="absolute z-50 w-full mt-2 bg-popover border rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
              {isLoading && (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  Loading locations...
                </div>
              )}

              {!isLoading && suggestions.length === 0 && (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No locations found
                </div>
              )}

              {!isLoading && suggestions.length > 0 && (
                <ul className="py-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={`${suggestion.type}-${suggestion.value}-${index}`}>
                      <button
                        onClick={() => handleLocationSelect(suggestion)}
                        className={cn(
                          "w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-accent transition-colors",
                          selectedIndex === index && "bg-accent"
                        )}
                      >
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{suggestion.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {suggestion.metadata.type}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          size="lg"
          className="h-12 px-8"
          disabled={!query.trim()}
        >
          Search
        </Button>
      </div>
    </div>
  );
}
