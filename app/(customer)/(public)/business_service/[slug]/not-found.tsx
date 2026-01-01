// app/business_service/[slug]/not-found.tsx

import { Button } from "@/components/ui/button";
import { MapPin, Search, Home, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function BusinessNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background px-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
          <div className="relative">
            <h1 className="text-9xl md:text-[12rem] font-bold text-primary/20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="h-24 w-24 text-primary animate-bounce" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Business Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            We couldn&apos;t find the business you&apos;re looking for. It may
            have been removed, renamed, or the link might be incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto gap-2">
            <Link href="/search">
              <Search className="h-4 w-4" />
              Search Businesses
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Suggestions Section */}
        <Suspense fallback={null}>
          <SuggestionsSection />
        </Suspense>

        {/* Help Section */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              href="/categories"
              className="text-primary hover:underline font-medium"
            >
              Browse Categories
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/locations"
              className="text-primary hover:underline font-medium"
            >
              Browse by Location
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Optional: Show trending/popular businesses
function SuggestionsSection() {
  return (
    <div className="pt-8 space-y-4">
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <TrendingUp className="h-4 w-4" />
        <p className="text-sm font-medium">You might be interested in:</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button asChild variant="secondary" size="sm">
          <Link href="/search?category=restaurants">Restaurants</Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/search?category=hotels">Hotels</Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/search?category=salons">Salons</Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/search?category=gyms">Gyms</Link>
        </Button>
      </div>
    </div>
  );
}
