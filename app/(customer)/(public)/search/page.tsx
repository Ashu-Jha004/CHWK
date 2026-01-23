// app/(customer)/(public)/search/page.tsx
// FIXED: Direct server-side import (no HTTP)

import { Header } from "@/components/LandingPage/layout/header";
import { SearchResultsClient } from "@/components/search/search-results";
import { performSearch } from "@/lib/search/server";
import { Metadata } from "next";

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || "";
  const location = params.location || "";

  const title = query
    ? `${query} ${location ? `in ${location}` : ""} | Search CHWK`
    : "Discover Local Businesses | CHWK";

  const description = query
    ? `Find the best ${query} ${location ? `in ${location}` : "near you"}. Read reviews, compare ratings, and connect with verified local businesses on CHWK.`
    : "Search for the best local businesses, restaurants, salons, and services across India on CHWK.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    lat?: string;
    lon?: string;
    radius?: string;
    category?: string;
    minRating?: string;
    priceRange?: string;
    verified?: string;
    page?: string;
    sort?: string;
  }>;
}

import { getCurrentUser } from "@/lib/auth";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Await searchParams (Next.js 15)
  const params = await searchParams;

  let latitude = params.lat ? parseFloat(params.lat) : undefined;
  let longitude = params.lon ? parseFloat(params.lon) : undefined;

  // Fallback to user default location if not provided in params
  if (!latitude || !longitude) {
    try {
      const user = await getCurrentUser();
      if (user?.defaultLatitude && user?.defaultLongitude) {
        latitude = user.defaultLatitude;
        longitude = user.defaultLongitude;
      }
    } catch (error) {
      // Ignore auth errors on public search page
      console.warn("Failed to fetch user defaults for search", error);
    }
  }

  // ✅ Direct function call - NO HTTP request!
  const data = await performSearch({
    query: params.q || "",
    location: params.location,
    latitude,
    longitude,
    radius: params.radius ? parseInt(params.radius) : undefined,
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 12,
    categorySlug: params.category,
    isVerified: params.verified === "true",
    minRating: params.minRating ? parseFloat(params.minRating) : undefined,
    priceRange: params.priceRange ? params.priceRange.split(",") as any : undefined,
    sortBy: (params.sort as any) || "relevance",
  });

  return (
    <div className="min-h-screen bg-gray-50">
            <Header  />
      <div className="h-20" />
      <div className="container-padding py-8">
        <SearchResultsClient initialData={data} searchParams={params} />
      </div>
    </div>
  );
}
