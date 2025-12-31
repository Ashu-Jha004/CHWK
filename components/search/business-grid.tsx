// components/search/business-grid.tsx
// Grid display of business cards

"use client";

import { BusinessSearchResult } from "@/types/search/types";
import { BusinessCard } from "./business-card";
interface BusinessGridProps {
  businesses: BusinessSearchResult[];
}

export function BusinessGrid({ businesses }: BusinessGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {businesses.map((business) => (
        <BusinessCard key={business.id} business={business} />
      ))}
    </div>
  );
}
