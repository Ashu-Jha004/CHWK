// components/business/video-preview-grid.tsx
"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Photo } from "@prisma/client";
import { getYouTubeID } from "@/lib/video";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

// ============================================================================
// CONSTANTS
// ============================================================================

const CAROUSEL_CONFIG = {
  CARD_WIDTH_DESKTOP: 450,
  CARD_WIDTH_MOBILE: 380,
  GAP: 24,
  AUTO_SCROLL_SPEED: 30, // ms per px
  PAUSE_DURATION: 3000, // ms
  DUPLICATION_FACTOR: 4,
  SWIPE_THRESHOLD: 50, // px
} as const;

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

export function VideoPreviewGrid({
  videos,
  onViewAll,
  totalCount,
  hideTitle
}: VideoPreviewGridProps) {
  // ================ Refs ================
  const containerRef = useRef<HTMLDivElement>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ================ State ================
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ================ Early Return ================
  if (!videos || videos.length === 0) {
    return null;
  }

  // ================ Memoized Values ================
  const duplicatedVideos = useMemo(
    () => Array(CAROUSEL_CONFIG.DUPLICATION_FACTOR).fill(videos).flat(),
    [videos]
  );

  const itemWidth = useMemo(
    () => CAROUSEL_CONFIG.CARD_WIDTH_DESKTOP + CAROUSEL_CONFIG.GAP,
    []
  );

  const totalWidth = useMemo(
    () => videos.length * itemWidth,
    [videos.length, itemWidth]
  );

  // ================ Helper Functions ================

  /**
   * Pauses auto-scroll temporarily and resumes after a delay
   */
  const temporarilyPause = useCallback(() => {
    setIsPaused(true);

    // Clear any existing timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    // Set new timeout
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      pauseTimeoutRef.current = null;
    }, CAROUSEL_CONFIG.PAUSE_DURATION);
  }, []);

  /**
   * Safely calculates the next offset with bounds checking
   */
  const calculateNextOffset = useCallback((current: number, direction: 'next' | 'prev'): number => {
    if (direction === 'next') {
      const newOffset = current + itemWidth;
      return newOffset >= totalWidth ? 0 : newOffset;
    } else {
      return current - itemWidth < 0 ? totalWidth - itemWidth : current - itemWidth;
    }
  }, [itemWidth, totalWidth]);

  // ================ Navigation Handlers ================

  const scrollNext = useCallback(() => {
    setOffset((prev) => calculateNextOffset(prev, 'next'));
    temporarilyPause();
  }, [calculateNextOffset, temporarilyPause]);

  const scrollPrev = useCallback(() => {
    setOffset((prev) => calculateNextOffset(prev, 'prev'));
    temporarilyPause();
  }, [calculateNextOffset, temporarilyPause]);

  const goToSlide = useCallback((index: number) => {
    // Validate index
    if (index < 0 || index >= videos.length) {
      console.warn(`Invalid slide index: ${index}. Must be between 0 and ${videos.length - 1}`);
      return;
    }

    setOffset(index * itemWidth);
    temporarilyPause();
  }, [videos.length, itemWidth, temporarilyPause]);

  // ================ Touch Handlers ================

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.targetTouches.length > 0) {
      setTouchStart(e.targetTouches[0].clientX);
      setTouchEnd(0); // Reset end position
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.targetTouches.length > 0) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > CAROUSEL_CONFIG.SWIPE_THRESHOLD;
    const isRightSwipe = distance < -CAROUSEL_CONFIG.SWIPE_THRESHOLD;

    if (isLeftSwipe) {
      scrollNext();
    } else if (isRightSwipe) {
      scrollPrev();
    }

    // Reset touch state
    setTouchStart(0);
    setTouchEnd(0);
  }, [touchStart, touchEnd, scrollNext, scrollPrev]);

  // ================ Effects ================

  /**
   * Track current slide based on offset
   */
  useEffect(() => {
    if (itemWidth === 0) return; // Prevent division by zero

    const slideIndex = Math.round(offset / itemWidth) % videos.length;
    setCurrentSlide(slideIndex);
  }, [offset, itemWidth, videos.length]);

  /**
   * Auto-scroll effect with proper cleanup
   */
  useEffect(() => {
    if (isPaused || videos.length === 0) return;

    const interval = setInterval(() => {
      setOffset((prev) => {
        const newOffset = prev + 1;
        return newOffset >= totalWidth ? 0 : newOffset;
      });
    }, CAROUSEL_CONFIG.AUTO_SCROLL_SPEED);

    return () => clearInterval(interval);
  }, [isPaused, totalWidth, videos.length]);

  /**
   * Cleanup pause timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  // ================ Mouse Handlers ================

  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);

  // ================ Render ================

  return (
    <section className={cn("py-8 relative group", hideTitle && "py-2")} aria-label="Videos and Virtual Tours">
      {!hideTitle && (
        <>
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" aria-hidden="true" />
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Videos & Virtual Tours</h2>
                <p className="text-muted-foreground text-sm mt-1">Experience the business from within</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Navigation Arrows - Desktop */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                  onClick={scrollPrev}
                  aria-label="Previous video"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                  onClick={scrollNext}
                  aria-label="Next video"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {onViewAll && (
                <Button
                  variant="ghost"
                  className="text-primary hover:text-primary/80 gap-2 font-semibold group/btn"
                  onClick={onViewAll}
                >
                  Learn More
                  <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Header - Simplified */}
          <div className="md:hidden mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 bg-primary rounded-full" aria-hidden="true" />
              <h2 className="text-xl font-bold tracking-tight">Videos & Virtual Tours</h2>
            </div>
            <p className="text-muted-foreground text-xs ml-3.5">Swipe to explore</p>
          </div>
        </>
      )}

      {/* Infinite Carousel Container */}
      <div
        className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label="Video carousel"
      >
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" aria-hidden="true" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" aria-hidden="true" />

        {/* Floating Navigation Arrows - Mobile */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-background/90 backdrop-blur-md border-border/50 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100"
          onClick={scrollPrev}
          aria-label="Previous video"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-background/90 backdrop-blur-md border-border/50 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100"
          onClick={scrollNext}
          aria-label="Next video"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div
          ref={containerRef}
          className="flex gap-6 w-max py-2"
          style={{
            transform: `translateX(-${offset}px)`,
            transition: 'transform 0.05s linear',
          }}
          role="list"
        >
          {duplicatedVideos.map((video, index) => (
            <div
              key={`${video.id}-${index}`}
              className="w-[380px] md:w-[450px] flex-shrink-0"
              role="listitem"
            >
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots - Mobile Only */}
      {videos.length > 1 && (
        <div className="md:hidden flex items-center justify-center gap-2 mt-4" role="tablist" aria-label="Video navigation">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                currentSlide === index
                  ? "w-8 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              role="tab"
              aria-selected={currentSlide === index}
              aria-label={`Go to video ${index + 1}`}
              aria-controls={`video-${index}`}
            />
          ))}
        </div>
      )}

      {/* View All Button - Mobile */}
      {onViewAll && !hideTitle && (
        <div className="md:hidden mt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-2 border-primary/30 hover:bg-primary/5"
            onClick={onViewAll}
          >
            View All Videos
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Desktop View All - Only show if conditions met */}
      {onViewAll && (!totalCount || totalCount <= videos.length) && !hideTitle && (
        <div className="hidden md:flex mt-8 justify-center">
          <Button
            variant="outline"
            className="rounded-full px-10 py-6 border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-lg transition-all duration-300 card-hover group"
            onClick={onViewAll}
          >
            Explore All Content
            <ChevronRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
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

  const [ref, isVisible] = useIntersectionObserver({
    rootMargin: '200px',
    freezeOnceVisible: true,
  });

  const videoId = useMemo(() => {
    try {
      return getYouTubeID(video.url);
    } catch (error) {
      console.error('Failed to extract YouTube ID:', error);
      return null;
    }
  }, [video.url]);

  const handleLoadVideo = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;

    // Try fallback thumbnail
    if (!hasError && videoId) {
      img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      setHasError(true);
    }
  }, [hasError, videoId]);

  // Early return if no valid video ID
  if (!videoId) {
    return null;
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const videoTitle = video.caption || "Business Video";

  return (
    <div
      ref={ref}
      className="group relative aspect-video rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl bg-black transition-all duration-500 hover:shadow-primary/10 hover:border-primary/20"
      id={`video-${videoId}`}
    >
      {!isLoaded ? (
        <button
          onClick={handleLoadVideo}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          aria-label={`Play video: ${videoTitle}`}
          type="button"
        >
          {/* Thumbnail - Only load when visible */}
          {isVisible && (
            <img
              src={thumbnailUrl}
              alt={videoTitle}
              className="absolute inset-0 w-full h-full object-cover opacity-70 transition-all duration-700 group-hover:scale-110 group-hover:opacity-40"
              loading="lazy"
              decoding="async"
              onError={handleImageError}
            />
          )}

          {/* Play Button */}
          <div className="relative z-10 w-20 h-20 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:bg-primary group-hover:border-primary/50 group-hover:scale-110 group-hover:shadow-primary/40">
            <Play className="fill-white text-white w-8 h-8 ml-1.5 transition-transform group-hover:scale-110" aria-hidden="true" />
          </div>

          {/* Caption Overlay */}
          {video.caption && (
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent transform translate-y-2 transition-transform duration-500 group-hover:translate-y-0 text-left">
              <p className="text-white text-base font-semibold tracking-wide drop-shadow-md line-clamp-1">
                {video.caption}
              </p>
              <p className="text-white/60 text-xs mt-1 uppercase tracking-widest font-medium">
                Video Tour
              </p>
            </div>
          )}

          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-primary/30 transition-all duration-500 rounded-3xl" aria-hidden="true" />
        </button>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
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
