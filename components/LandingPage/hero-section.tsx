"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAutocomplete } from "@/hooks/search/use-autocomplete";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Navigation,
} from "lucide-react";
import { parseSmartQuery } from "@/lib/search/query-parser";
import { uiSelectors } from "@/store/landing_page/ui-store";
import { CATEGORIES, TIER_1_CITIES } from "@/lib/(landing_page)/constants";
import { cn, scrollToElement } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const LOCATION_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const GEOLOCATION_TIMEOUT = 8000; // 8 seconds
const SUGGESTION_CLOSE_DELAY = 200; // ms

// ============================================
// SECURE LOCATION STORAGE UTILITY
// ============================================

interface StoredLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
}

class LocationStorage {
  private static readonly KEY = "user_location";
  private static readonly TIMESTAMP_KEY = "location_timestamp";

  // Validate and sanitize location data [web:26]
  static set(location: StoredLocation): void {
    try {
      // Validate coordinates
      if (
        typeof location.latitude !== "number" ||
        typeof location.longitude !== "number" ||
        Math.abs(location.latitude) > 90 ||
        Math.abs(location.longitude) > 180
      ) {
        throw new Error("Invalid coordinates");
      }

      // Store with validation metadata
      const data = {
        ...location,
        timestamp: Date.now(),
        version: "1.0", // For future compatibility
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(this.KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to store location:", error);
    }
  }

  static get(): StoredLocation | null {
    try {
      if (typeof window === "undefined") return null;

      const stored = localStorage.getItem(this.KEY);
      if (!stored) return null;

      const data = JSON.parse(stored) as StoredLocation & { version: string };

      // Validate cached data [web:27]
      if (Date.now() - data.timestamp > LOCATION_CACHE_DURATION) {
        this.clear();
        return null;
      }

      return data;
    } catch (error) {
      console.error("Failed to retrieve location:", error);
      this.clear();
      return null;
    }
  }

  static clear(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.KEY);
      localStorage.removeItem(this.TIMESTAMP_KEY);
      // Remove legacy keys
      localStorage.removeItem("userLat");
      localStorage.removeItem("userLon");
      localStorage.removeItem("locationDetected");
    }
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export function HeroSection() {
  // State
  const [searchFocused, setSearchFocused] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Refs for keyboard navigation [web:21][web:22]
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suggestionCloseTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // Hooks
  const router = useRouter();
  const { query, location, setQuery, setLocation } = uiSelectors.useSearch();
  const { city, setCity } = uiSelectors.usePreferredCity();
  const { data: suggestions, isLoading: suggestionsLoading } = useAutocomplete(query);

  // Popular searches with proper typing
  const popularSearches = useMemo<any>(
    () => [
      { id: "p1", text: "Restaurants near me", type: "category" },
      { id: "p2", text: `Best salons in ${city}`, type: "category" },
      { id: "p3", text: `Plumbers in ${city}`, type: "category" },
    ],
    [city]
  );

  // Combined suggestions list (typed properly)
  const displayedSuggestions = useMemo<(any)[]>(
    () => (query.length >= 2 ? suggestions || [] : popularSearches),
    [query, suggestions, popularSearches]
  );

  // ============================================
  // GEOLOCATION WITH BEST PRACTICES
  // ============================================

  const handleDetectLocation = useCallback(async () => {
    setLocationOpen(false);
    setIsDetectingLocation(true);

    try {
      if (!("geolocation" in navigator)) {
        toast("Geolocation not supported");
        return;
      }

      // Check for cached location first [web:27][web:30]
      const cachedLocation = LocationStorage.get();
      if (cachedLocation) {
        setLocation("Near me");
       toast("Location detected");
        setIsDetectingLocation(false);
        return;
      }

      // Request new location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          // Store securely with validation [web:26][web:27]
          LocationStorage.set({
            latitude,
            longitude,
            accuracy,
            timestamp: Date.now(),
          });

          setLocation("Near me");

         toast("Location detected");

          setIsDetectingLocation(false);
        },
        (error) => {
          // Clear stale data
          LocationStorage.clear();

          let title = "";
          let description = "";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              title = "Location access denied";
              description =
                "Enable location access in your browser settings, then refresh and try again.";
              break;

            case error.POSITION_UNAVAILABLE:
              title = "Location unavailable";
              description =
                "GPS signal is weak or unavailable. Please enter your city manually.";
              break;

            case error.TIMEOUT:
              title = "Location request timeout";
              description =
                "Taking too long to detect location. Try using your city name instead.";
              break;

            default:
              title = "Location error";
              description = "Please enter your city manually.";
          }

         toast(title);

          setLocation(city);
          setIsDetectingLocation(false);
        },
        {
          enableHighAccuracy: false, // Faster response [web:27][web:30]
          timeout: GEOLOCATION_TIMEOUT,
          maximumAge: LOCATION_CACHE_DURATION, // Use cached position
        }
      );
    } catch (error) {
      console.error("Location detection error:", error);
      toast("Location error");
      setLocation(city);
      setIsDetectingLocation(false);
    }
  }, [setLocation, city, toast]);

  // ============================================
  // SEARCH HANDLER WITH ERROR HANDLING
  // ============================================

  // ============================================
  // SEARCH HANDLER WITH SMART PARSING
  // ============================================

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();

      try {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
          toast("Empty search");
          inputRef.current?.focus();
          return;
        }

        if (trimmedQuery.length < 2) {
          toast("Query too short");
          return;
        }

        // SMART PARSE LOGIC
        const { query: cleanQuery, location: parsedLocation } = parseSmartQuery(trimmedQuery);

        const params = new URLSearchParams();
        params.set("q", cleanQuery);

        // Get location data securely [web:26]
        const storedLocation = LocationStorage.get();

        // Priority:
        // 1. Parsed location from query ("Pizza in Brooklyn")
        // 2. "Near me" with GPS
        // 3. Current selected location/city

        if (parsedLocation) {
             params.set("location", parsedLocation);
             // Optionally update UI state to reflect this discovery
             setLocation(parsedLocation);
        } else if (storedLocation && location === "Near me") {
          // Use GPS coordinates for "near me" search
          params.set("lat", storedLocation.latitude.toString());
          params.set("lon", storedLocation.longitude.toString());
          params.set("radius", "10"); // 10km radius
        } else if (location || city) {
          // Use city name
          params.set("location", location || city);
        }

        // Navigate to search results
        router.push(`/search?${params.toString()}`);
      } catch (error) {
        console.error("Search error:", error);
        toast("Search error");
      }
    },
    [query, location, city, router, toast, setLocation]
  );

  // ============================================
  // KEYBOARD NAVIGATION [web:21][web:22][web:25]
  // ============================================

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions) return;

      const maxIndex = displayedSuggestions.length - 1;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
          break;

        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex <= maxIndex) {
            const selected = displayedSuggestions[selectedIndex];
            handleSuggestionClick(selected);
          } else {
            handleSearch();
          }
          break;

        case "Escape":
          e.preventDefault();
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;

        case "Tab":
          // Close suggestions on tab
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [showSuggestions, selectedIndex, displayedSuggestions, handleSearch]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[0]?.children[
        selectedIndex + 1
      ] as HTMLElement;
      selectedElement?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  // ============================================
  // SUGGESTION HANDLERS
  // ============================================

  const handleSuggestionClick = useCallback(
    (item: any | any) => {
      if (item.type === "business" && "slug" in item) {
        router.push(`/business_service/${item.slug}`);
      } else {
        setQuery(item.text);
        setShowSuggestions(false);
        // Trigger search
        setTimeout(() => handleSearch(), 0);
      }
    },
    [router, setQuery, handleSearch]
  );

  const handleInputBlur = useCallback(() => {
    setSearchFocused(false);
    // Delay to allow clicking suggestions
    suggestionCloseTimer.current = setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, SUGGESTION_CLOSE_DELAY);
  }, []);

  const handleInputFocus = useCallback(() => {
    setSearchFocused(true);
    setShowSuggestions(true);
    // Clear any pending close timer
    if (suggestionCloseTimer.current) {
      clearTimeout(suggestionCloseTimer.current);
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (suggestionCloseTimer.current) {
        clearTimeout(suggestionCloseTimer.current);
      }
    };
  }, []);

  // ============================================
  // LOCATION SELECTION
  // ============================================

  const handleLocationSelect = useCallback(
    (selectedCity: string) => {
      try {
        setCity(selectedCity);
        setLocation(selectedCity);
        setLocationOpen(false);
        // Clear GPS location when manually selecting city
        LocationStorage.clear();
      } catch (error) {
        console.error("Location selection error:", error);
      toast("Location selection error");
      }
    },
    [setCity, setLocation, toast]
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden py-20 md:py-22">
      {/* Background (unchanged) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full shadow-sm mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-700">
              Trusted by 850,000+ users across India
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in-up">
            Discover the Best{" "}
            <span className="text-gradient">Local Businesses</span>
            <br />
            Near You
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            From restaurants to salons, repairs to healthcare - find verified
            businesses with genuine reviews in your city.
          </p>

          {/* Search Box with Accessibility */}
          <div className="bg-white rounded-2xl shadow-2xl p-2 md:p-3 mb-8 animate-fade-in-up animation-delay-400">
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-2"
              role="search"
              aria-label="Business search form"
            >
              {/* Search Input with ARIA */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for restaurants, salons, services..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  className="pl-12 h-14 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  aria-label="Search query"
                  aria-autocomplete="list"
                  aria-controls="search-suggestions"
                  aria-expanded={showSuggestions}
                  aria-activedescendant={
                    selectedIndex >= 0
                      ? `suggestion-${selectedIndex}`
                      : undefined
                  }
                  autoComplete="off"
                />

                {/* Accessible Suggestions Dropdown [web:21][web:22][web:28] */}
                {showSuggestions && (
                  <div
                    ref={suggestionsRef}
                    id="search-suggestions"
                    role="listbox"
                    aria-label="Search suggestions"
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase px-3 py-2">
                        {query.length >= 2 ? "Results" : "Popular Searches"}
                      </p>

                      {displayedSuggestions.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          id={`suggestion-${index}`}
                          aria-selected={index === selectedIndex}
                          onMouseDown={() => handleSuggestionClick(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            "w-full text-left px-3 py-3 rounded-lg flex items-center justify-between group transition-colors",
                            index === selectedIndex
                              ? "bg-primary/10"
                              : "hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {item.type === "category" ? (
                              <Sparkles className="w-4 h-4 text-primary/60" />
                            ) : (
                              <Building2 className="w-4 h-4 text-gray-400" />
                            )}
                            <div>
                              <p
                                className={cn(
                                  "text-sm font-medium",
                                  index === selectedIndex
                                    ? "text-primary"
                                    : "text-gray-800 group-hover:text-primary"
                                )}
                              >
                                {item.text}
                              </p>
                              {"subText" in item && item.subText && (
                                <p className="text-[10px] text-gray-400 uppercase">
                                  {item.subText}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronRight
                            className={cn(
                              "w-4 h-4 text-gray-300 transition-all",
                              index === selectedIndex
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            )}
                          />
                        </button>
                      ))}

                      {suggestionsLoading && (
                        <div className="p-4 text-center" role="status">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                          <span className="sr-only">Loading suggestions...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Selector */}
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="h-14 px-4 md:px-6 border-0 md:border bg-gray-50 hover:bg-gray-100 gap-2 min-w-[160px]"
                    aria-label={`Current location: ${city}`}
                  >
                    <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
                    <span className="font-medium">{location || city}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-3 border-b">
                    <h4 className="font-semibold text-sm mb-2">
                      Select Your City
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      className="w-full gap-2"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      aria-label="Detect my current location"
                    >
                      {isDetectingLocation ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4" />
                      )}
                      {isDetectingLocation
                        ? "Detecting..."
                        : "Detect My Location"}
                    </Button>
                  </div>
                  <div
                    className="max-h-[300px] overflow-y-auto p-2"
                    role="listbox"
                    aria-label="City selection"
                  >
                    {TIER_1_CITIES.map((cityName) => (
                      <button
                        key={cityName}
                        type="button"
                        role="option"
                        aria-selected={city === cityName}
                        onClick={() => handleLocationSelect(cityName)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-md transition-colors hover:bg-gray-50",
                          city === cityName &&
                            "bg-primary/10 text-primary font-medium"
                        )}
                      >
                        {cityName}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Search Button */}
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 btn-shine gap-2 text-base font-semibold"
                aria-label="Submit search"
              >
                Search
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </Button>
            </form>
          </div>

          {/* Popular Categories Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10 animate-fade-in animation-delay-600">
            <span className="text-sm text-gray-600 mr-2">Popular:</span>
            {CATEGORIES.slice(0, 5).map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => {
                  setQuery(category.name);
                  setTimeout(() => handleSearch(), 0);
                }}
              >
                {category.name}
              </Badge>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-800">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-base"
              onClick={() => scrollToElement("how-it-works")}
            >
              How It Works
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="default"
              className="gap-2 text-base bg-primary text-white btn-shine hover:bg-primary/90 transition-colors"
            >
              List Your Business
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
