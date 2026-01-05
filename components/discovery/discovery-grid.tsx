// components/discovery/discovery-grid.tsx
'use client';

import { memo, useState, useEffect, useRef } from 'react';
import MediaCard from './media-card';

interface Media {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  type: string;
  width: number | null;
  height: number | null;
  displayOrder: number | null;
  isFeatured: boolean;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  distance: number;
  location: {
    city: string;
    state: string;
    area: string | null;
  };
  rating: number | null;
  reviewCount: number;
  isVerified: boolean;
  quickStats: {
    is24x7: boolean;
    hasEmergencyService: boolean;
    acceptsBookings: boolean;
    acceptsOrders: boolean;
  };
  priceRange: string | null;
  media: Media[];
}

interface MediaWithBusiness {
  mediaId: string;
  mediaUrl: string;
  mediaThumbnail: string | null;
  mediaCaption: string | null;
  mediaType: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  distance: number;
  rating: number | null;
  reviewCount: number;
  isVerified: boolean;
  city: string;
  area: string | null;
}

interface DiscoveryGridProps {
  businesses: Business[];
  isLoading?: boolean;
}

/**
 * Shuffle array randomly (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Loading Skeleton for Discovery Grid
 */
function DiscoveryGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Mixed skeletons */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border/50 bg-card">
            <div className="aspect-[4/3] animate-pulse bg-muted" />
            <div className="p-3 space-y-2 sm:hidden">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Video skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
        <div className="aspect-video animate-pulse bg-muted" />
        <div className="p-4 space-y-3">
          <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border/50 bg-card">
            <div className="aspect-[4/3] animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-5xl shadow-lg">
          🔍
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          No businesses found
        </h3>
        <p className="mt-3 text-muted-foreground">
          Try adjusting your search radius or check back later
        </p>
      </div>
    </div>
  );
}

/**
 * Discovery Grid Component
 * Randomly mixes videos and photos in a Masonry-style grid
 * Supports Infinite Scroll without reshuffling existing items
 */
const DiscoveryGrid = memo(({ businesses, isLoading = false }: DiscoveryGridProps) => {
  const [gridItems, setGridItems] = useState<Array<{ media: MediaWithBusiness; span: string }>>([]);
  const processedCountRef = useRef(0);
  const processedMediaCountRef = useRef(0);
  const startIdRef = useRef<string | null>(null);

  // Calculate total media count to detect updates
  const currentMediaCount = businesses.reduce((acc, b) => acc + (b.media?.length || 0), 0);

  // Helper to process a batch of businesses into grid items
  const processBatch = (batch: Business[]) => {
    // 1. Collect media from batch
    const videos: MediaWithBusiness[] = [];
    const images: MediaWithBusiness[] = [];

    batch.forEach((business) => {
      if (!business.media) return;
      business.media.forEach((media) => {
        const item: MediaWithBusiness = {
          mediaId: media.id,
          mediaUrl: media.url,
          mediaThumbnail: media.thumbnailUrl,
          mediaCaption: media.caption,
          mediaType: media.type,
          businessId: business.id,
          businessName: business.name,
          businessSlug: business.slug,
          distance: business.distance,
          rating: business.rating,
          reviewCount: business.reviewCount,
          isVerified: business.isVerified,
          city: business.location.city,
          area: business.location.area,
        };

        if (media.type === 'VIDEO') {
          videos.push(item);
        } else {
          images.push(item);
        }
      });
    });

    // 2. Shuffle (local shuffle for this batch)
    const shuffledVideos = shuffleArray(videos);
    const shuffledImages = shuffleArray(images);

    // 3. Interleave
    const items: Array<{ media: MediaWithBusiness; span: string }> = [];
    let vIndex = 0;
    let iIndex = 0;
    let lastWasVideo = false; // Track if the last block contained a video

    while (vIndex < shuffledVideos.length || iIndex < shuffledImages.length) {
      const remainingVideos = shuffledVideos.length - vIndex;
      const remainingImages = shuffledImages.length - iIndex;
      const separationRatio = remainingVideos > 0 ? remainingImages / remainingVideos : remainingImages;

      // Decision Logic:
      // If we MUST separate (last was video), add images.
      // OR if we have no videos left, add images.
      // OR if we decide to add images probabilistically (to vary layout).
      const forceImages = lastWasVideo || remainingVideos === 0;

      if (forceImages) {
         if (remainingImages === 0) {
             // Crisis: No images to separate. We must add video if available, or break.
             if (remainingVideos > 0) {
                 // Forced neighbor videos
                 items.push({ media: shuffledVideos[vIndex++], span: 'col-span-2 row-span-2' });
                 lastWasVideo = true;
             } else {
                 break; // Done
             }
         } else {
             // Add a chunk of images
             // Adaptive: If we have many images, use more. If few, conserve (min 1).
             // Cap at 4 to avoid huge image walls, but allow at least 1.
             // If ratio is high (>4), we can be generous. If low (<1), be stingy.
             let count = 1;
             if (separationRatio >= 4) count = 4;
             else if (separationRatio >= 2) count = 2;
             else count = 1;

             // Consume up to 'count' images
             const limit = Math.min(count, remainingImages);
             for(let k=0; k<limit; k++) {
                 items.push({ media: shuffledImages[iIndex++], span: 'col-span-1' });
             }
             lastWasVideo = false; // Successfully added images
         }
      } else {
         // Safe to add Video (or Image)
         // Prefer Video to unblock queue, but respect random distribution?
         // Actually, if we are NOT forced to add images, we SHOULD add a video if available
         // to ensure they get distributed and not clumped at the end.
         items.push({ media: shuffledVideos[vIndex++], span: 'col-span-2 row-span-2' });
         lastWasVideo = true;
      }
    }
    return items;
  };

  useEffect(() => {
    // Handle empty state
    if (!businesses || businesses.length === 0) {
      setGridItems([]);
      processedCountRef.current = 0;
      processedMediaCountRef.current = 0;
      startIdRef.current = null;
      return;
    }

    const firstId = businesses[0].id;
    const isNewFeed = startIdRef.current !== firstId;
    // Check if we have new media items (even if business count is same)
    const hasMoreMedia = currentMediaCount > processedMediaCountRef.current;

    console.log('[DiscoveryGrid] 🔄 Update check:', {
      isNewFeed,
      businessLength: businesses.length,
      processedBusiness: processedCountRef.current,
      currentMedia: currentMediaCount,
      processedMedia: processedMediaCountRef.current
    });

    if (isNewFeed) {
      // Complete reset (New Category or Sort)
      const items = processBatch(businesses);
      setGridItems(items);
      processedCountRef.current = businesses.length;
      processedMediaCountRef.current = currentMediaCount;
      startIdRef.current = firstId;
    } else if (businesses.length > processedCountRef.current || hasMoreMedia) {
      // Append (Infinite Scroll or content update)
      // Note: If content updated (same business, more media), we technically should re-process that business?
      // For simplicity in infinite scroll, we usually slice.
      // But if 'hasMoreMedia' is true but 'businesses.length' is same, it means existing businesses got more media.
      // Slicing might fail if we slice by count.

      // Strategy: If business count increased, process new businesses.
      // If ONLY media count increased (same businesses), we might need to re-process EVERYTHING or just the diff?
      // Since 'processBatch' randomizes, re-processing everything reshuffles.
      // To keep stability, we only handle appending NEW businesses here.
      // But if the user issue is "few assets", it implies initial load might have been partial?
      // Let's assume 'processBatch' handles the SLICE.

      const newBusinessCount = businesses.length - processedCountRef.current;

      if (newBusinessCount > 0) {
        const newBatch = businesses.slice(processedCountRef.current);
        const newItems = processBatch(newBatch);
        setGridItems((prev) => [...prev, ...newItems]);
        processedCountRef.current = businesses.length;
        processedMediaCountRef.current = currentMediaCount;
      } else if (hasMoreMedia && !isNewFeed) {
         // Same businesses, but more media? (e.g. refetch).
         // Force re-process all to show all media (sacrifice stability for correctness here)
         const items = processBatch(businesses);
         setGridItems(items);
         processedCountRef.current = businesses.length;
         processedMediaCountRef.current = currentMediaCount;
      }
    }
  }, [businesses, currentMediaCount]);


  if (isLoading && gridItems.length === 0) {
    return <DiscoveryGridSkeleton />;
  }

  if (gridItems.length === 0 && !isLoading) {
    return <EmptyState />;
  }

  return (
    <div className="animate-scale-in">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] sm:auto-rows-[250px] grid-flow-dense">
        {gridItems.map((item, index) => (
          <MediaCard
            key={`${item.media.businessId}-${item.media.mediaId}-${index}`}
            media={item.media}
            index={index}
            className={`h-full w-full ${item.span}`}
          />
        ))}
      </div>

      {/* Results Summary */}
      <div className="mt-8 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{gridItems.length}</span> photos & videos from{' '}
          <span className="font-semibold text-foreground">{businesses.length}</span>{' '}
          {businesses.length === 1 ? 'business' : 'businesses'}
        </p>
      </div>
    </div>
  );
});

DiscoveryGrid.displayName = 'DiscoveryGrid';

export default DiscoveryGrid;
