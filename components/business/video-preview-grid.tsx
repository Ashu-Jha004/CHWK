// components/business/video-preview-grid.tsx
"use client";

import { useState, useMemo, useRef } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!videos || videos.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth * 0.8
        : scrollLeft + clientWidth * 0.8;

      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

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
            {!hideTitle && videos.length > 2 && (
              <div className="flex items-center gap-2 mr-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                  onClick={() => scroll('left')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                  onClick={() => scroll('right')}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}

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
      )}

      {/* Slider Container */}
      <div
        ref={scrollRef}
        className={cn(
          "hide-scrollbar",
          hideTitle
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 -mx-4 px-4 scroll-smooth"
        )}
      >
        {videos.map((video) => (
          <div
            key={video.id}
            className={cn(
              "relative",
              !hideTitle && "flex-none w-[85%] md:w-[45%] snap-center"
            )}
          >
            <VideoCard video={video} />
          </div>
        ))}
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
