// app/(customer)/(public)/search/page.tsx
// FIXED: Direct server-side import (no HTTP)

import { Header } from "@/components/LandingPage/layout/header";
import { SearchResultsClient } from "@/components/search/search-results";
import { performSearch } from "@/lib/search/server";

export const metadata = {
  title: "Search Results | Your App Name",
  description: "Find the best local businesses near you",
};

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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Await searchParams (Next.js 15)
  const params = await searchParams;

  // ✅ Direct function call - NO HTTP request!
  const data = await performSearch({
    q: params.q,
    page: params.page ? parseInt(params.page, 10) : 1,
    categoryId: params.category,
    isVerified: params.verified === "true",
    // Add other conversions if needed (sortBy, etc)
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
