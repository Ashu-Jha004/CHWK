// components/discovery/empty-state-advanced.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  totalBusinesses: number;
}

interface PopularBusiness {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  city: string;
  state: string;
  area: string | null;
  averageRating: number | null;
  totalReviews: number;
  isVerified: boolean;
  priceRange: string | null;
  photos: Array<{
    id: string;
    url: string;
    type: string;
  }>;
}

interface EmptyStateAdvancedProps {
  currentCategorySlug: string;
  currentCategoryName: string;
  radius: number;
  city?: string;
  state?: string;
  onExpandRadius: (newRadius: number) => void;
}

/**
 * Advanced Empty State Component
 * Shows nearby categories and popular businesses in city
 */
export default function EmptyStateAdvanced({
  currentCategorySlug,
  currentCategoryName,
  radius,
  city,
  state,
  onExpandRadius,
}: EmptyStateAdvancedProps) {
  const [nearbyCategories, setNearbyCategories] = useState<Category[]>([]);
  const [popularBusinesses, setPopularBusinesses] = useState<PopularBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSuggestions() {
      setIsLoading(true);

      try {
        // Fetch nearby categories
        const categoriesRes = await fetch(
          `/api/category/nearby?currentSlug=${currentCategorySlug}&limit=4`
        );
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setNearbyCategories(categoriesData.data || []);
        }

        // Fetch popular businesses in city
        if (city && state) {
          const businessesRes = await fetch(
            `/api/business/popular?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&limit=4`
          );
          if (businessesRes.ok) {
            const businessesData = await businessesRes.json();
            setPopularBusinesses(businessesData.data || []);
          }
        }
      } catch (error) {
        console.error('[EmptyState] Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuggestions();
  }, [currentCategorySlug, city, state]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Main Empty State */}
      <div className="glass rounded-2xl border border-border/50 bg-card p-8 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-5xl shadow-lg">
          📍
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          No {currentCategoryName} found within {radius}km
        </h2>
        <p className="mt-3 text-muted-foreground">
          Don't worry! Here are some options to help you find what you're looking for
        </p>

        {/* Expand Radius Options */}
        {radius < 50 && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {radius < 20 && (
              <Button onClick={() => onExpandRadius(20)} size="lg" className="btn-shine">
                <Sparkles className="mr-2 h-4 w-4" />
                Search within 20km
              </Button>
            )}
            {radius < 50 && (
              <Button onClick={() => onExpandRadius(50)} size="lg" variant="outline">
                Search within 50km
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Nearby Categories Suggestions */}
      {nearbyCategories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">
              Try exploring other categories
            </h3>
            <Link
              href="/categories"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {nearbyCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group glass rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl transition-transform group-hover:scale-110">
                    {category.icon || '📂'}
                  </div>
                  <h4 className="font-medium text-foreground line-clamp-1">
                    {category.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {category.totalBusinesses} available
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Popular Businesses in City */}
      {popularBusinesses.length > 0 && city && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            Popular businesses in {city}
          </h3>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {popularBusinesses.map((business) => (
              <Link
                key={business.id}
                href={`/business_service/${business.slug}`}
                className="group glass overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/50 hover:shadow-lg"
              >
                {/* Business Image */}
                {business.photos[0] && (
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={business.photos[0].url}
                      alt={business.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Business Info */}
                <div className="p-3">
                  <h4 className="font-medium text-foreground line-clamp-1">
                    {business.name}
                  </h4>
                  {business.averageRating && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      ⭐ {business.averageRating.toFixed(1)} ({business.totalReviews})
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-8 animate-pulse">
           <div className="mx-auto h-6 w-48 rounded bg-muted" />
           <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
             {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-muted" />
             ))}
           </div>
        </div>
      )}
    </div>
  );
}
