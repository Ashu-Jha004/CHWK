"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useBusiness } from "@/context/business-context";
import { useRouter, usePathname } from "next/navigation";
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
  Navigation,
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
import { UserButton } from "@/components/auth/user-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import Image from "next/image";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false); // Added missing state
  const scrollDirection = useScrollDirection({ threshold: 50 });
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { isBusinessOwner } = useBusiness();

  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu } =
    uiSelectors.useMobileMenu();
  const { query, location, setQuery, setLocation } = uiSelectors.useSearch();
  const { city, setCity } = uiSelectors.usePreferredCity();

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

  // components/LandingPage/layout/header.tsx
  // Same improved GPS detection

  const handleDetectLocation = useCallback(async () => {
    try {
      setLocationOpen(false);

      if (!("geolocation" in navigator)) {
        alert(
          "Geolocation is not supported by your browser. Please enter your city manually."
        );
        return;
      }

      console.log("Requesting location...");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log("Location detected:", { latitude, longitude, accuracy });

          setLocation("Near me");

          localStorage.setItem("userLat", latitude.toString());
          localStorage.setItem("userLon", longitude.toString());
          localStorage.setItem("locationDetected", "true");
          localStorage.setItem("locationTimestamp", Date.now().toString());

          console.log("✓ Location detected successfully!");
        },
        (error) => {
          console.error("Geolocation error:", error);
          localStorage.removeItem("locationDetected");

          let message = "";
          let suggestion = "";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = "Location access was denied.";
              suggestion =
                "Enable location access in browser settings, then try again.\n\nOr enter your city name manually.";
              break;

            case error.POSITION_UNAVAILABLE:
              message = "Location unavailable.";
              suggestion = "Please enter your city name manually.";
              break;

            case error.TIMEOUT:
              message = "Location timeout.";
              suggestion =
                "Try using Chrome/Edge on mobile for GPS.\n\nOr enter your city manually.";
              break;

            default:
              message = "Location error.";
              suggestion = "Please enter your city manually.";
          }

          alert(`${message}\n\n${suggestion}`);
          setLocation(city);
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 600000,
        }
      );
    } catch (error) {
      console.error("Error in location detection:", error);
      alert("Failed to detect location. Please enter your city manually.");
      setLocation(city);
    }
  }, [setLocation, city]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;

      try {
        const params = new URLSearchParams();
        params.set("q", query);

        const userLat = localStorage.getItem("userLat");
        const userLon = localStorage.getItem("userLon");
        const locationDetected = localStorage.getItem("locationDetected");

        if (
          locationDetected === "true" &&
          userLat &&
          userLon &&
          location === "Near me"
        ) {
          params.set("lat", userLat);
          params.set("lon", userLon);
          params.set("radius", "10");
        } else {
          params.set("location", location || city);
        }

        window.location.href = `/search?${params.toString()}`;
      } catch (error) {
        console.error("Search error:", error);
      }
    },
    [query, location, city]
  );

  const handleCityChange = useCallback(
    (selectedCity: string) => {
      setCity(selectedCity);
      setLocation(selectedCity);
      localStorage.setItem("locationDetected", "false"); // Reset GPS if city picked manually
      setLocationOpen(false);
    },
    [setCity, setLocation]
  );

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
            >
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" width={50} height={50} />
              </div>
              <span className="font-bold text-xl md:text-2xl text-gray-900">
                CHWK
              </span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="/categories"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary capitalize"
                >
                  Categories
                </Link>
                {["how-it-works", "testimonials"].map((id) => (
                  <button
                    key={id}
                    onClick={() => scrollToElement(id)}
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-primary capitalize"
                  >
                    {id.replace("-", " ")}
                  </button>
                ))}
              </nav>
            )}

            {/* Right Section */}
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-4">
                <Sheet open={locationOpen} onOpenChange={setLocationOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{location || city}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Select Your Location</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 text-primary"
                        onClick={handleDetectLocation}
                      >
                        <Navigation className="w-4 h-4" />
                        Detect My Location
                      </Button>
                      <div className="space-y-2">
                        {TIER_1_CITIES.map((cityName) => (
                          <button
                            key={cityName}
                            onClick={() => handleCityChange(cityName)}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-lg transition-colors",
                              location === cityName || city === cityName
                                ? "bg-primary text-white"
                                : "hover:bg-gray-100"
                            )}
                          >
                            {cityName}
                          </button>
                        ))}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {isBusinessOwner ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => router.push("/business/dashboard")}
                  >
                    <Building2 className="w-4 h-4" />
                    Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => router.push("/business/onboarding")}
                  >
                    <Building2 className="w-4 h-4" />
                    For Businesses
                  </Button>
                )}

                {!isSignedIn ? (
                  <Link href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2 btn-shine"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <NotificationBell />
                    <UserButton />
                  </div>
                )}
              </div>
            )}

            {/* Mobile Actions */}
            {isMobile && (
              <div className="flex items-center gap-2">
                {isSignedIn && <NotificationBell />}
                <Button
                  variant="ghost"
                  onClick={toggleMobileMenu}
                  className="p-2"
                  aria-expanded={isMobileMenuOpen}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Scrolled Search Bar */}
          {!isMobile && isScrolled && (
            <div className="px-4 md:px-6 pb-4 animate-in fade-in slide-in-from-top-2">
              <form
                onSubmit={handleSearch}
                className="max-w-2xl mx-auto flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search services..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
            </div>
          )}

        </div>
      </header>

      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={toggleMobileMenu}
        city={city}
        onCityChange={handleCityChange}
      />
      <div className={cn("h-16 md:h-20", isMobile && "h-28")} />
    </>
  );
}
