"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Menu,
  X,
  Search,
  MapPin,
  ChevronDown,
  Building2,
  LogIn,
} from "lucide-react";
import { uiSelectors } from "@/store/landing_page/ui-store";
import { useScrollDirection } from "@/hooks/landing_page/use-scroll-direction";
import { useMediaQuery } from "@/hooks/landing_page/use-media-query";
import { cn, scrollToElement } from "@/lib/utils";
import { TIER_1_CITIES } from "@/lib/(landing_page)/constants";
import { MobileNav } from "./mobile-nav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Main Header Component
 * Features: Sticky header, search bar, location selector, auth buttons
 * Performance: Optimized with useMemo and useCallback
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollDirection = useScrollDirection({ threshold: 50 });
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Zustand store selectors
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu } =
    uiSelectors.useMobileMenu();
  const { query, location, setQuery, setLocation } = uiSelectors.useSearch();
  const { city, setCity } = uiSelectors.usePreferredCity();

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      try {
        setIsScrolled(window.scrollY > 20);
      } catch (error) {
        console.error("Error tracking scroll position:", error);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle search submission
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (query.trim()) {
          // TODO: Navigate to search results page
          console.log("Searching for:", query, "in", location || city);
          // Example: router.push(`/search?q=${query}&location=${location || city}`);
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    },
    [query, location, city]
  );

  // Handle city selection
  const handleCityChange = useCallback(
    (selectedCity: string) => {
      try {
        setCity(selectedCity);
        setLocation(selectedCity);
      } catch (error) {
        console.error("Error changing city:", error);
      }
    },
    [setCity, setLocation]
  );

  // Scroll to section helper
  const handleScrollToSection = useCallback((sectionId: string) => {
    scrollToElement(sectionId);
  }, []);

  // Memoized header class names
  const headerClassName = useMemo(
    () =>
      cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-transparent",
        scrollDirection === "down" && isScrolled
          ? "-translate-y-full"
          : "translate-y-0"
      ),
    [isScrolled, scrollDirection]
  );

  return (
    <>
      <header className={headerClassName}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-6">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 focus-visible-ring"
              aria-label="CHWK Home"
            >
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span
                className={cn(
                  "font-bold text-xl md:text-2xl transition-colors",
                  isScrolled ? "text-gray-900" : "text-gray-900"
                )}
              >
                CHWK
              </span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => handleScrollToSection("categories")}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary focus-visible-ring",
                    isScrolled ? "text-gray-700" : "text-gray-800"
                  )}
                >
                  Categories
                </button>
                <button
                  onClick={() => handleScrollToSection("how-it-works")}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary focus-visible-ring",
                    isScrolled ? "text-gray-700" : "text-gray-800"
                  )}
                >
                  How It Works
                </button>
                <button
                  onClick={() => handleScrollToSection("testimonials")}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary focus-visible-ring",
                    isScrolled ? "text-gray-700" : "text-gray-800"
                  )}
                >
                  Reviews
                </button>
                <Link
                  href="#contact"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary focus-visible-ring",
                    isScrolled ? "text-gray-700" : "text-gray-800"
                  )}
                >
                  Contact
                </Link>
              </nav>
            )}

            {/* Right Section - Desktop */}
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-4">
                {/* City Selector */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 focus-visible-ring"
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{city}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Select Your City</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-2">
                      {TIER_1_CITIES.map((cityName) => (
                        <button
                          key={cityName}
                          onClick={() => handleCityChange(cityName)}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-lg transition-colors focus-visible-ring",
                            city === cityName
                              ? "bg-primary text-white"
                              : "hover:bg-gray-100"
                          )}
                        >
                          {cityName}
                        </button>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Business Login */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 focus-visible-ring"
                >
                  <Building2 className="w-4 h-4" />
                  For Business
                </Button>

                {/* Sign In */}
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 btn-shine focus-visible-ring"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Button
                type="button"
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus-visible-ring"
                aria-label="Toggle menu"
                // Fix: Explicitly cast the boolean to a string to satisfy strict ARIA parsers
                aria-expanded={isMobileMenuOpen ? "true" : "false"}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            )}
          </div>

          {/* Search Bar - Desktop (shown when scrolled) */}
          {!isMobile && isScrolled && (
            <div className="px-4 md:px-6 pb-4 animate-fade-in">
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search restaurants, salons, services..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-10 focus-visible-ring"
                    />
                  </div>
                  <Button type="submit" className="btn-shine">
                    Search
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => toggleMobileMenu()}
        city={city}
        onCityChange={handleCityChange}
      />

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16 md:h-20" />
    </>
  );
}
