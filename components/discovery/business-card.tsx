// components/discovery/business-card.tsx
'use client';

import { useMemo, memo } from 'react';
import Link from 'next/link';
import { MapPin, Star, CheckCircle, Clock, Phone, ShoppingBag } from 'lucide-react';
import YouTubeVideo from './youtube-video';
import CloudinaryImage from './cloudinary-image';

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

interface BusinessCardProps {
  business: Business;
  index?: number;
}

/**
 * Business Discovery Card
 * Pinterest-style card with media and business info
 */
const BusinessCard = memo(({ business, index = 0 }: BusinessCardProps) => {
  // Sort media: Videos first, then featured, then by display order
  const sortedMedia = useMemo(() => {
    return [...business.media].sort((a, b) => {
      // Videos first
      if (a.type === 'VIDEO' && b.type !== 'VIDEO') return -1;
      if (a.type !== 'VIDEO' && b.type === 'VIDEO') return 1;

      // Then featured
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;

      // Then by display order
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      return orderA - orderB;
    });
  }, [business.media]);

  // Get primary media (first item)
  const primaryMedia = sortedMedia[0];

  // Price range display
  const priceRangeMap: Record<string, string> = {
    BUDGET: '₹',
    MODERATE: '₹₹',
    EXPENSIVE: '₹₹₹',
    LUXURY: '₹₹₹₹',
  };

  return (
    <Link
      href={`/business_service/${business.slug}`}
      className="group block"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="card-hover overflow-hidden rounded-lg border border-border/50 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
        {/* Media Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {primaryMedia?.type === 'VIDEO' ? (
            <YouTubeVideo
              url={primaryMedia.url}
              caption={primaryMedia.caption}
              autoPlay={false}
            />
          ) : primaryMedia ? (
            <CloudinaryImage
              url={primaryMedia.url}
              alt={business.name}
              caption={primaryMedia.caption}
              type={primaryMedia.type}
              priority={index < 4}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <p className="text-sm text-muted-foreground">No image available</p>
            </div>
          )}

          {/* Media Count Badge */}
          {business.media.length > 1 && (
            <div className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              +{business.media.length - 1}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4">
          {/* Business Name */}
          <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-1">
            {business.name}
          </h3>

          {/* Location + Distance */}
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {business.location.area || business.location.city}
            </span>
            <span>•</span>
            <span className="shrink-0 font-medium text-foreground">
              {business.distance}km
            </span>
          </div>

          {/* Rating + Reviews */}
          <div className="mt-2 flex items-center gap-2">
            {business.rating && business.rating > 0 ? (
              <>
                <div className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5">
                  <Star className="h-3.5 w-3.5 fill-success text-success" />
                  <span className="text-sm font-medium text-success">
                    {business.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">No reviews yet</span>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {business.isVerified && (
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <CheckCircle className="h-3 w-3" />
                Verified
              </div>
            )}

            {business.quickStats.is24x7 && (
              <div className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-foreground">
                <Clock className="h-3 w-3" />
                24/7
              </div>
            )}

            {business.quickStats.acceptsBookings && (
              <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                <Phone className="h-3 w-3" />
                Bookings
              </div>
            )}

            {business.quickStats.acceptsOrders && (
              <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                <ShoppingBag className="h-3 w-3" />
                Orders
              </div>
            )}

            {business.priceRange && (
              <div className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {priceRangeMap[business.priceRange] || business.priceRange}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});

BusinessCard.displayName = 'BusinessCard';

export default BusinessCard;
