"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Navigation,
} from "lucide-react";
import { uiSelectors } from "@/store/landing_page/ui-store";
import { CATEGORIES, TIER_1_CITIES } from "@/lib/(landing_page)/constants";
import { cn, scrollToElement } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Hero Section Component
 * Main landing section with search functionality and CTAs
 */
export function HeroSection() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Zustand store
  const { query, location, setQuery, setLocation } = uiSelectors.useSearch();
  const { city, setCity } = uiSelectors.usePreferredCity();

  // Popular searches for suggestions
  const popularSearches = useMemo(
    () => [
      "Restaurants near me",
      "Best salons in " + city,
      "Plumbers in " + city,
      "Doctors near me",
      "Gyms in " + city,
      "Home cleaning services",
    ],
    [city]
  );

  // Filter suggestions based on query
  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return popularSearches;

    const lowerQuery = query.toLowerCase();
    return [
      ...CATEGORIES.filter((cat) =>
        cat.name.toLowerCase().includes(lowerQuery)
      ).map((cat) => `${cat.name} in ${city}`),
      ...popularSearches.filter((search) =>
        search.toLowerCase().includes(lowerQuery)
      ),
    ].slice(0, 6);
  }, [query, popularSearches, city]);

  // components/LandingPage/hero-section.tsx
  // Find and replace the handleSearch function

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (query.trim()) {
          const params = new URLSearchParams();
          params.set("q", query);

          // Check if location was detected via GPS
          const userLat = localStorage.getItem("userLat");
          const userLon = localStorage.getItem("userLon");
          const locationDetected = localStorage.getItem("locationDetected");

          if (
            locationDetected === "true" &&
            userLat &&
            userLon &&
            location === "Near me"
          ) {
            // Use GPS coordinates for "near me" search
            params.set("lat", userLat);
            params.set("lon", userLon);
            params.set("radius", "10"); // Default 10km radius
            console.log("Searching with GPS:", userLat, userLon);
          } else if (location || city) {
            // Use city name for regular search
            params.set("location", location || city);
          }

          // Navigate to search results
          window.location.href = `/search?${params.toString()}`;
        }
      } catch (error) {
        console.error("Search submission error:", error);
      }
    },
    [query, location, city]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setQuery(suggestion);
      setShowSuggestions(false);
    },
    [setQuery]
  );

  // Handle location selection
  const handleLocationSelect = useCallback(
    (selectedCity: string) => {
      try {
        setCity(selectedCity);
        setLocation(selectedCity);
        setLocationOpen(false);
      } catch (error) {
        console.error("Location selection error:", error);
      }
    },
    [setCity, setLocation]
  );

  // Detect user location
  // UPDATED CODE:
  // components/LandingPage/hero-section.tsx
  // Find and replace the handleDetectLocation function

// components/LandingPage/hero-section.tsx
// IMPROVED: GPS detection with better error handling

const handleDetectLocation = useCallback(async () => {
  try {
    setLocationOpen(false);

    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser. Please enter your city manually.");
      return;
    }

    console.log("Requesting location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log("Location detected:", { latitude, longitude, accuracy });

        // Update UI
        setLocation("Near me");

        // Store in localStorage
        localStorage.setItem("userLat", latitude.toString());
        localStorage.setItem("userLon", longitude.toString());
        localStorage.setItem("locationDetected", "true");
        localStorage.setItem("locationTimestamp", Date.now().toString());

        // Success feedback
        console.log("✓ Location detected successfully!");
        // Optional: Add toast notification here
      },
      (error) => {
        console.error("Geolocation error:", error);

        // Clear any old location data
        localStorage.removeItem("locationDetected");

        let message = "";
        let suggestion = "";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access was denied.";
            suggestion = "To use 'Near Me' search:\n\n1. Click the lock icon in your browser's address bar\n2. Allow location access\n3. Refresh the page and try again\n\nOr enter your city name manually.";
            break;

          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            suggestion = "This can happen if:\n• GPS signal is weak\n• You're using a desktop without GPS\n• Location services are disabled\n\nPlease enter your city name manually.";
            break;

          case error.TIMEOUT:
            message = "Location request timed out.";
            suggestion = "This usually happens on:\n• Desktop computers\n• Poor GPS signal areas\n• VPN/Proxy usage\n\nTIP: Try using Chrome or Edge on mobile for best results.\n\nFor now, please enter your city name manually.";
            break;

          default:
            message = "An unknown error occurred.";
            suggestion = "Please enter your city name manually.";
        }

        alert(`${message}\n\n${suggestion}`);

        // Reset location to city
        setLocation(city);
      },
      {
        enableHighAccuracy: false, // ✅ Changed to false for faster response
        timeout: 8000, // ✅ Reduced timeout to 8 seconds
        maximumAge: 600000, // ✅ Accept cached position up to 10 minutes old
      }
    );
  } catch (error) {
    console.error("Error in location detection:", error);
    alert("Failed to detect location. Please enter your city manually.");
    setLocation(city);
  }
}, [setLocation, city]);


  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden py-20 md:py-22">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10" />

      {/* Animated Background Shapes */}
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

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-2 md:p-3 mb-8 animate-fade-in-up animation-delay-400">
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-2"
            >
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for restaurants, salons, services..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    setSearchFocused(true);
                    setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    setSearchFocused(false);
                    // Delay to allow clicking suggestions
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className="pl-12 h-14 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />

                {/* Search Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 animate-fade-in">
                    <div className="p-2">
                      <p className="text-xs text-gray-500 font-semibold uppercase px-3 py-2">
                        Suggested Searches
                      </p>
                      {filteredSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onMouseDown={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
                        >
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {suggestion}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Selector */}
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-14 px-4 md:px-6 border-0 md:border bg-gray-50 hover:bg-gray-100 gap-2 min-w-[160px]"
                  >
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-medium">{city}</span>
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
                      className="w-full gap-2"
                      onClick={handleDetectLocation}
                    >
                      <Navigation className="w-4 h-4" />
                      Detect My Location
                    </Button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {TIER_1_CITIES.map((cityName) => (
                      <button
                        key={cityName}
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
              >
                Search
                <ChevronRight className="w-5 h-5" />
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
                  handleSearch({ preventDefault: () => {} } as React.FormEvent);
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
              className="gap-2 text-base bg-primary text-white btn-shine hover:bg-primary/90 transition-colors  "
            >
              List Your Business
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
