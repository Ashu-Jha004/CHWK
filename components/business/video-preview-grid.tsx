// components/business/video-preview-grid.tsx
"use client";

import React, { useState, useMemo, useRef } from "react";
import { Photo } from "@prisma/client";
import { getYouTubeID } from "@/lib/video";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface VideoPreviewGridProps {
  videos: Photo[];
  onViewAll?: () => void;
  totalCount?: number;
  hideTitle?: boolean;
}

export function VideoPreviewGrid({ videos, onViewAll, totalCount, hideTitle }: VideoPreviewGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  if (!videos || videos.length === 0) return null;

  // Duplicate videos for seamless infinite loop
  const duplicatedVideos = [...videos, ...videos, ...videos, ...videos];
  const cardWidth = 450; // md:w-[450px]
  const mobileCardWidth = 300; // mobile width
  const gap = 24; // gap-6
  const itemWidth = cardWidth + gap;

  // Manual navigation functions
  const scrollNext = () => {
    setOffset((prev) => {
      const totalWidth = videos.length * itemWidth;
      const newOffset = prev + itemWidth;
      return newOffset >= totalWidth ? 0 : newOffset;
    });
    // Pause auto-scroll temporarily when user manually navigates
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000); // Resume after 3 seconds
  };

  const scrollPrev = () => {
    setOffset((prev) => {
      const totalWidth = videos.length * itemWidth;
      return prev - itemWidth < 0 ? totalWidth - itemWidth : prev - itemWidth;
    });
    // Pause auto-scroll temporarily when user manually navigates
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000); // Resume after 3 seconds
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      scrollNext();
    }
    if (isRightSwipe) {
      scrollPrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Auto-scroll effect
  React.useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setOffset((prev) => {
        const newOffset = prev + 1;
        const totalWidth = videos.length * itemWidth;

        // Reset to beginning when we've scrolled through one set
        if (newOffset >= totalWidth) {
          return 0;
        }
        return newOffset;
      });
    }, 30); // Adjust speed here (lower = faster)

    return () => clearInterval(interval);
  }, [isPaused, videos.length, itemWidth]);

  return (
    <section className={cn("py-8 relative group", hideTitle && "py-2")}>
      {!hideTitle && (
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Videos & Virtual Tours</h2>
              <p className="text-muted-foreground text-sm mt-1">Experience the business from within</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation Arrows - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                onClick={scrollNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {onViewAll && (
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/80 gap-2 font-semibold group/btn hidden md:flex"
                onClick={onViewAll}
              >
                Learn More
                <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Infinite Carousel Container */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Floating Navigation Arrows - Mobile */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-border hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-lg"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-border hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-lg"
          onClick={scrollNext}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div
          ref={containerRef}
          className="flex gap-6 w-max"
          style={{
            transform: `translateX(-${offset}px)`,
            transition: 'transform 0.05s linear',
          }}
        >
          {duplicatedVideos.map((video, index) => (
            <div
              key={`${video.id}-${index}`}
              className="w-[300px] md:w-[450px] flex-shrink-0"
            >
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      </div>

      {onViewAll && (!totalCount || totalCount <= videos.length) && !hideTitle && (
        <div className="mt-8 flex justify-center">
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

function VideoCard({ video }: { video: Photo }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, isVisible] = useIntersectionObserver({
    rootMargin: '200px',
    freezeOnceVisible: true,
  });
  const videoId = useMemo(() => getYouTubeID(video.url), [video.url]);

  if (!videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div ref={ref} className="group relative aspect-video rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl bg-black transition-all duration-500 hover:shadow-primary/10 hover:border-primary/20">
      {!isLoaded ? (
        <button
          onClick={() => setIsLoaded(true)}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          aria-label="Play video"
        >
          {/* Only load thumbnail when visible */}
          {isVisible && (
            <img
              src={thumbnailUrl}
              alt={video.caption || "Business Video"}
              className="absolute inset-0 w-full h-full object-cover opacity-70 transition-all duration-700 group-hover:scale-110 group-hover:opacity-40"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
          )}

          {/* Interactive Play Button */}
          <div className="relative z-10 w-20 h-20 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:bg-primary group-hover:border-primary/50 group-hover:scale-110 group-hover:shadow-primary/40">
            <Play className="fill-white text-white w-8 h-8 ml-1.5 transition-transform group-hover:scale-110" />
          </div>

          {/* Premium Caption Overlay */}
          {video.caption && (
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent transform translate-y-2 transition-transform duration-500 group-hover:translate-y-0 text-left">
              <p className="text-white text-base font-semibold tracking-wide drop-shadow-md line-clamp-1">{video.caption}</p>
              <p className="text-white/60 text-xs mt-1 uppercase tracking-widest font-medium">Video Tour</p>
            </div>
          )}

          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-primary/30 transition-all duration-500 rounded-3xl" />
        </button>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={video.caption || "Business Video"}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  );
}
