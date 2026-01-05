// components/discovery/discovery-page-client.tsx
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation } from '@/hooks/use-location';
import { useInfiniteBusinesses } from '@/hooks/use-infinite-businesses';
import LocationPrompt from '@/components/location/location-prompt';
import { Header } from '@/components/LandingPage/layout/header';
import FilterTabs from './filter-tabs';
import DiscoveryGrid from './discovery-grid';
import InfiniteScrollTrigger from './infinite-scroll-trigger';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyStateAdvanced from './empty-state-advanced';
import ScrollToTop from './scroll-to-top';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

interface DiscoveryPageClientProps {
  category: Category;
}

/**
 * Discovery Page Client Component
 * Now with infinite scroll support
 */
export default function DiscoveryPageClient({ category }: DiscoveryPageClientProps) {
  const [radius, setRadius] = useState(20);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'reviews'>('distance');
  const [recycledBatches, setRecycledBatches] = useState<any[]>([]); // Store recycled business data

  // Get user location
  const {
    location,
    isLoading: isLocationLoading,
    error: locationError,
    permissionDenied,
    refetch: refetchLocation,
  } = useLocation();

  // Fetch businesses with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isBusinessLoading,
    error: businessError,
    refetch: refetchBusinesses,
  } = useInfiniteBusinesses(category.slug, location?.latitude, location?.longitude, radius, sortBy);

  // Flatten all pages into single array (server already handled sorting)
  // Flatten all pages into single array (server already handled sorting)
  const allBusinesses = useMemo(() => {
    if (!data?.pages) return [];
    const fetched = data.pages.flatMap((page) => page.data);
    return [...fetched, ...recycledBatches];
  }, [data?.pages, recycledBatches]);

  // Handle radius change with debounce
  const handleRadiusChange = useCallback((newRadius: number) => {
    // Debounce the state update to prevent API spam
    const timeoutId = setTimeout(() => {
      setRadius(newRadius);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, []);



  // Handle sort change
  const handleSortChange = useCallback(
    (newSort: 'distance' | 'rating' | 'reviews') => {
      setSortBy(newSort);
    },
    []
  );

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    } else if (!hasNextPage && !isFetchingNextPage && allBusinesses.length > 0) {
      // Infinite Loop: Recycle existing data when server data ends
      // Appending the current set of businesses again to the list
      // We use a functional update to ensure we have the latest data

      // Get base businesses (excluding already recycled ones to avoid exponential growth if we just copied allBusinesses)
      // Actually simpler: just take the distinct base set from 'data'
      const baseBusinesses = data?.pages.flatMap((p) => p.data) || [];

      if (baseBusinesses.length > 0) {
         setRecycledBatches(prev => [...prev, ...baseBusinesses]);
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, allBusinesses.length, data?.pages]);

  // Show location prompt if no location
  if (isLocationLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container-padding section-spacing mx-auto max-w-7xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Detecting your location...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (locationError || !location) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container-padding section-spacing mx-auto max-w-2xl">
          <LocationPrompt
            error={locationError}
            permissionDenied={permissionDenied}
            onRetry={refetchLocation}
          />
        </div>
      </main>
    );
  }

  // Business fetch error
  const hasBusinessError = businessError && !isBusinessLoading;

  // Get total results from first page
  const totalResults = data?.pages[0]?.pagination.totalResults || 0;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-16 lg:pt-20">
        {/* Why pt-20? Header is fixed. */}

        {/* Simple Breadcrumb / Title Bar - Optional but nice for context */}


        {/* Hero Section */}
        <section className="border-b border-border/50 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container-padding section-spacing-tight mx-auto max-w-7xl">
            <div className="text-center">
              {/* Category Icon */}
              {category.icon && (
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-4xl">
                  {category.icon}
                </div>
              )}

              {/* Category Name */}
              <h1 className="text-responsive-2xl font-bold tracking-tight text-foreground">
                {category.name}
              </h1>

              {/* Description */}
              {category.description && (
                <p className="mt-3 text-lg text-muted-foreground">
                  {category.description}
                </p>
              )}

              {/* Location Info */}
              <p className="mt-2 text-sm text-muted-foreground">
                {location.city && location.state
                  ? `Showing results near ${location.city}, ${location.state}`
                  : 'Showing results near your location'}
              </p>

              {/* Total Results Badge */}
              {totalResults > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                  <span className="text-sm font-medium text-primary">
                    {totalResults} {totalResults === 1 ? 'business' : 'businesses'} found
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Filters Section - Sticky Tab Bar */}
        <section className="sticky top-16 lg:top-20 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
          <div className="container-padding py-3 mx-auto max-w-7xl">
             <FilterTabs
               radius={radius}
               onRadiusChange={handleRadiusChange}
               sortBy={sortBy}
               onSortChange={handleSortChange}
               disabled={isBusinessLoading}
             />
          </div>
        </section>

        {/* Results Section */}
        <section className="section-spacing">
          <div className="container-padding mx-auto max-w-7xl">
            {/* Error State */}
            {hasBusinessError && (
              <div className="glass mx-auto max-w-2xl rounded-lg border border-destructive/50 bg-card p-6 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Failed to load businesses
                </h3>
                  <p className="mt-2 text-muted-foreground">
                    {businessError instanceof Error
                      ? businessError.message
                      : 'Something went wrong. Please try again.'}
                  </p>
                  <Button
                    onClick={() => refetchBusinesses()}
                    className="btn-shine mt-6"
                  >
                    Try Again
                  </Button>
              </div>
            )}

            {/* Discovery Grid */}
            {!hasBusinessError && (
              <>
                <DiscoveryGrid
                  businesses={allBusinesses}
                  isLoading={isBusinessLoading && !isFetchingNextPage}
                />

                {/* Infinite Scroll Trigger */}
                {!isBusinessLoading && allBusinesses.length > 0 && (
                  <InfiniteScrollTrigger
                    onLoadMore={handleLoadMore}
                    hasMore={true} // Always true because of recycling loop
                    isLoading={isFetchingNextPage}
                  />
                )}
              </>
            )}

            {/* Empty State with Expand Option */}
            {!isBusinessLoading &&
              !hasBusinessError &&
              allBusinesses.length === 0 && (
                <EmptyStateAdvanced
                  currentCategorySlug={category.slug}
                  currentCategoryName={category.name}
                  radius={radius}
                  city={location.city}
                  state={location.state}
                  onExpandRadius={handleRadiusChange}
                />
              )}

          </div>
        </section>
      </main>
      <ScrollToTop />
    </>
  );
}
