// components/discovery/media-card.tsx
'use client';

import { memo } from 'react';
import Link from 'next/link';
import { MapPin, Star, CheckCircle, TrendingUp } from 'lucide-react';
import YouTubeVideo from './youtube-video';
import CloudinaryImage from './cloudinary-image';

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

interface MediaCardProps {
  media: MediaWithBusiness;
  index?: number;
  className?: string;
}

/**
 * Video Card Component (Full Width Rectangle)
 * Modern design with text below the video
 */
const VideoCard = memo(({ media, index, className }: { media: MediaWithBusiness; index: number; className?: string }) => {
  return (
    <Link
      href={`/business_service/${media.businessSlug}`}
      className={`group block ${className || ''}`}
      style={{
        animationDelay: `${index * 30}ms`,
      }}
    >
      <article className="card-hover h-full flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-2xl">
        {/* Video Section - Full Width */}
        <div className="relative w-full flex-1 bg-black">
          <div className="flex h-full items-center justify-center">
             <YouTubeVideo
               url={media.mediaUrl}
               caption={null} // Don't show caption in overlay
               autoPlay={true}
               className="w-full h-full object-cover"
             />
          </div>
        </div>

        {/* Info Section Below Video */}
        <div className="bg-gradient-to-b from-card to-muted/20 p-4 space-y-3">
          {/* Business Name with Verified Badge */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="flex-1 font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-1 text-lg">
              {media.businessName}
            </h3>
            {media.isVerified && (
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 shrink-0">
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Verified</span>
              </div>
            )}
          </div>

          {/* Location + Distance with Modern Icon */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-foreground">{media.area || media.city}</p>
              <p className="text-xs text-muted-foreground">{media.distance}km away</p>
            </div>
          </div>

          {/* Rating + Reviews with Modern Badge */}
          <div className="flex items-center gap-3">
            {media.rating && media.rating > 0 ? (
              <>
                <div className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-success/20 to-success/10 px-3 py-1.5 shadow-sm">
                  <Star className="h-4 w-4 fill-success text-success" />
                  <span className="text-sm font-bold text-success">{media.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{media.reviewCount} {media.reviewCount === 1 ? 'review' : 'reviews'}</span>
                </div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic">No reviews yet</span>
            )}
          </div>

          {/* Caption if available */}
          {media.mediaCaption && (
            <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t border-border/50">
              {media.mediaCaption}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
});

VideoCard.displayName = 'VideoCard';

/**
 * Photo Card Component (Grid Item)
 * Compact design with overlay on desktop, text below on mobile
 */
const PhotoCard = memo(({ media, index, className }: { media: MediaWithBusiness; index: number; className?: string }) => {
  return (
    <Link
      href={`/business_service/${media.businessSlug}`}
      className={`group block ${className || ''}`}
      style={{
        animationDelay: `${index * 30}ms`,
      }}
    >
      <article className="card-hover h-full flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-xl">
        {/* Image Section */}
        <div className="relative flex-1 overflow-hidden">
          <div className="h-full w-full">
            <CloudinaryImage
              url={media.mediaUrl}
              alt={media.businessName}
              caption={media.mediaCaption}
              type={media.mediaType}
              priority={index < 8}
              className="object-cover h-full w-full"
            />
          </div>

          {/* Desktop Overlay (hidden on mobile) */}
          <div className="absolute inset-0 hidden bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-semibold text-white line-clamp-1">
                {media.businessName}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-white/90">
                <MapPin className="h-3 w-3" />
                <span>{media.area || media.city}</span>
                <span>•</span>
                <span>{media.distance}km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Info Section (below image) - visible only on mobile */}
        <div className="bg-card p-3 sm:hidden space-y-2">
          {/* Business Name */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex-1 font-semibold text-foreground line-clamp-1 text-sm">
              {media.businessName}
            </h3>
            {media.isVerified && (
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
            )}
          </div>

          {/* Location + Distance */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{media.area || media.city}</span>
            <span>•</span>
            <span className="shrink-0">{media.distance}km</span>
          </div>

          {/* Rating */}
          {media.rating && media.rating > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 w-fit">
              <Star className="h-3 w-3 fill-success text-success" />
              <span className="text-xs font-medium text-success">
                {media.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
});

PhotoCard.displayName = 'PhotoCard';

/**
 * Main Media Card Component
 * Routes to VideoCard or PhotoCard based on media type
 */
const MediaCard = memo(({ media, index = 0, className }: MediaCardProps) => {
  // Use VideoCard for videos, PhotoCard for images
  if (media.mediaType === 'VIDEO') {
    return <VideoCard media={media} index={index} className={className} />;
  }

  return <PhotoCard media={media} index={index} className={className} />;
});

MediaCard.displayName = 'MediaCard';

export default MediaCard;
