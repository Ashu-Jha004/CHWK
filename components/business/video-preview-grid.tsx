// components/business/video-preview-grid.tsx
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Photo } from "@prisma/client";
import { getYouTubeID } from "@/lib/video";
import { Play, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface VideoPreviewGridProps {
  videos: Photo[];
  onViewAll?: () => void;
  totalCount?: number;
  hideTitle?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Modern Grid-based Video Preview Gallery
 * Removed carousel animations, blur effects, and implemented clean card design.
 */
export function VideoPreviewGrid({
  videos,
  onViewAll,
  hideTitle
}: VideoPreviewGridProps) {
  // ================ Early Return ================
  if (!videos || videos.length === 0) {
    return null;
  }

  // ================ Render ================
  return (
    <section className={cn("py-6", hideTitle && "py-2")} aria-label="Videos and Virtual Tours">
      {!hideTitle && (
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]" aria-hidden="true" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Videos & Virtual Tours</h2>
            <p className="text-muted-foreground text-sm">Experience the business from within</p>
          </div>
        </div>
      )}

      {/* Modern Responsive Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        role="list"
      >
        {videos.map((video) => (
          <div key={video.id} role="listitem">
            <VideoCard video={video} />
          </div>
        ))}
      </div>

      {onViewAll && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onViewAll}
            className="px-6 py-2.5 rounded-full border border-primary/20 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors"
          >
            Show All Media
          </button>
        </div>
      )}
    </section>
  );
}

// ============================================================================
// VIDEO CARD COMPONENT
// ============================================================================

function VideoCard({ video }: { video: Photo }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const videoId = useMemo(() => {
    try {
      return getYouTubeID(video.url);
    } catch (error) {
      console.error('Failed to extract YouTube ID:', error);
      return null;
    }
  }, [video.url]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    if (!hasError && videoId) {
      img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      setHasError(true);
    }
  }, [hasError, videoId]);

  if (!videoId) {
    return null;
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const videoTitle = video.caption || "Business Video Tour";

  return (
    <div
      className="group relative aspect-video rounded-xl overflow-hidden border border-border bg-black shadow-sm transition-all duration-300 hover:shadow-md hover:border-border-hover"
      id={`video-${videoId}`}
    >
      {!isLoaded ? (
        <button
          onClick={() => setIsLoaded(true)}
          className="relative w-full h-full flex items-center justify-center outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Play video: ${videoTitle}`}
          type="button"
        >
          {/* Main Thumbnail */}
          <img
            src={thumbnailUrl}
            alt={videoTitle}
            className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
            loading="lazy"
            onError={handleImageError}
          />

          {/* Playing Indicator / YouTube Icon */}
          <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded bg-black/60 border border-white/10">
            <Youtube className="w-4 h-4 text-red-600" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">YouTube</span>
          </div>

          {/* Minimalist Play Button */}
          <div className="relative z-10 w-14 h-14 flex items-center justify-center rounded-full bg-primary text-white shadow-xl transform transition-transform group-hover:scale-105 active:scale-95">
            <Play className="fill-current w-6 h-6 ml-1" aria-hidden="true" />
          </div>

          {/* Caption Overlay - Clean Design */}
          {video.caption && (
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/40 to-transparent">
              <p className="text-white text-sm font-semibold tracking-wide line-clamp-1">
                {video.caption}
              </p>
            </div>
          )}
        </button>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&autohide=1&showinfo=0`}
          title={videoTitle}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  );
}
