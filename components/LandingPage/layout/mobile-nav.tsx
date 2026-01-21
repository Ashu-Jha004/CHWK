"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { useBusiness } from "@/context/business-context";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@/components/auth/user-button";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Home,
  Grid,
  Info,
  MessageSquare,
  Building2,
  LogIn,
  User,
  X,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { uiSelectors } from "@/store/landing_page/ui-store";
import { cn, scrollToElement } from "@/lib/utils";
import { TIER_1_CITIES } from "@/lib/(landing_page)/constants";
import { Badge } from "@/components/ui/badge";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  city: string;
  onCityChange: (city: string) => void;
}

/**
 * Mobile Navigation Component
 * Full-screen overlay with navigation links and city selector
 */
export function MobileNav({
  isOpen,
  onClose,
  city,
  onCityChange,
}: MobileNavProps) {
   const router = useRouter();
   const pathname = usePathname();
  const { isBusinessOwner } = useBusiness();
  const { isSignedIn, user } = useUser();
  const { query, setQuery, location } = uiSelectors.useSearch();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;

      try {
        const params = new URLSearchParams();
        params.set("q", query);
        params.set("location", location || city);
        router.push(`/search?${params.toString()}`);
        onClose();
      } catch (error) {
        console.error("Search error:", error);
      }
    },
    [query, location, city, router, onClose]
  );

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle navigation click
  const handleNavClick = useCallback(
    (sectionId: string) => {
      try {
        scrollToElement(sectionId);
        onClose();
      } catch (error) {
        console.error("Navigation error:", error);
      }
    },
    [onClose]
  );

  // Handle city selection
  const handleCitySelect = useCallback(
    (selectedCity: string) => {
      try {
        onCityChange(selectedCity);
        // Don't close menu - let user navigate after selection
      } catch (error) {
        console.error("City selection error:", error);
      }
    },
    [onCityChange]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[999] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <nav
        className={cn(
          "fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white z-[1000] overflow-y-auto",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="font-bold text-xl">CHWK</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 focus-visible-ring"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search for services..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl btn-shine font-semibold">
                Search
              </Button>
            </form>
          </div>

          {/* City Selector */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-semibold text-gray-900">Your City</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TIER_1_CITIES.map((cityName) => (
                <Badge
                  key={cityName}
                  variant={city === cityName ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    city === cityName
                      ? "bg-primary hover:bg-primary/90"
                      : "hover:border-primary"
                  )}
                  onClick={() => handleCitySelect(cityName)}
                >
                  {cityName}
                </Badge>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => handleNavClick("hero")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors focus-visible-ring"
            >
              <Home className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Home</span>
            </button>

            <Link
              href="/categories"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors focus-visible-ring"
            >
              <Grid className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Categories</span>
            </Link>

            <button
              onClick={() => handleNavClick("how-it-works")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors focus-visible-ring"
            >
              <Info className="w-5 h-5 text-gray-600" />
              <span className="font-medium">How It Works</span>
            </button>

            <button
              onClick={() => handleNavClick("testimonials")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors focus-visible-ring"
            >
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Reviews</span>
            </button>

            <Link
              href="#contact"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors focus-visible-ring"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Contact</span>
            </Link>

            {/* Divider */}
            <div className="h-px bg-gray-200 my-4" />

            {/* Business Section */}
            <div className="px-4 py-2">
              <p className="text-xs text-gray-500 font-semibold uppercase mb-2">
                For Businesses
              </p>
              {isBusinessOwner ? (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    router.push("/business/dashboard");
                    onClose();
                  }}
                >
                  <Building2 className="w-5 h-5" />
                  Business Dashboard
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    router.push("/business/onboarding");
                    onClose();
                  }}
                >
                  <Building2 className="w-5 h-5" />
                  List Your Business
                </Button>
              )}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="p-6 border-t bg-gray-50 space-y-3">
             {isSignedIn ? (
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                  <UserButton />
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium text-sm truncate">{user?.fullName || "User"}</span>
                    <span className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</span>
                  </div>
                </div>
             ) : (
                <Button
                  className="w-full gap-2 btn-shine"
                  size="lg"
                  onClick={() => {
                    router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
                    onClose();
                  }}
                >
                  <LogIn className="w-5 h-5" />
                  Sign In / Sign Up
                </Button>
             )}
          </div>
        </div>
      </nav>
    </>
  );
}
