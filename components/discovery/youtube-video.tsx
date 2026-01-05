// components/discovery/youtube-video.tsx
'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { Play } from 'lucide-react';

interface YouTubeVideoProps {
  url: string;
  caption?: string | null;
  autoPlay?: boolean;
  className?: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function getYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }

    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }

    return null;
  } catch (error) {
    console.error('[YouTubeVideo] Invalid URL:', url, error);
    return null;
  }
}

/**
 * YouTube Video Component
 * Auto-plays when in viewport, pauses when out of viewport
 * Only ONE video plays at a time for performance
 */
const YouTubeVideo = memo(({
  url,
  caption,
  autoPlay = true,
  className = '',
}: YouTubeVideoProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoId = getYouTubeVideoId(url);

  // Intersection Observer for viewport detection
  useEffect(() => {
    if (!containerRef.current || !videoId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);

          if (entry.isIntersecting) {
            // Video entered viewport - load and play
            if (autoPlay && !isLoaded) {
              setIsLoaded(true);
            }
            setShouldPlay(true);
          } else {
            // Video left viewport - mark for pause
            setShouldPlay(false);
          }
        });
      },
      {
        threshold: 0.5, // 50% of video must be visible
        rootMargin: '50px'
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [videoId, autoPlay, isLoaded]);

  if (!videoId) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">Invalid video URL</p>
      </div>
    );
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  // Dynamic embed URL based on viewport state
  const embedUrl = shouldPlay
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`
    : `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

  return (
    <div
      ref={containerRef}
      className={`group relative overflow-hidden rounded-lg bg-black ${className || 'aspect-video'}`}
    >
      {/* Thumbnail (before load) */}
      {!isLoaded && isInView && !autoPlay && (
        <>
          <img
            src={thumbnailUrl}
            alt={caption || 'Video thumbnail'}
            className="h-full w-full object-cover"
            loading="lazy"
          />

          <button
            onClick={() => setIsLoaded(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all hover:bg-black/40"
            aria-label="Play video"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 backdrop-blur-sm transition-transform group-hover:scale-110">
              <Play className="h-8 w-8 fill-white text-white" />
            </div>
          </button>

          <div className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            VIDEO
          </div>
        </>
      )}

      {/* YouTube iframe */}
      {isLoaded && isInView && (
        <>
          <iframe
            key={shouldPlay ? 'playing' : 'paused'} // Re-mount to control play/pause
            src={embedUrl}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            title={caption || 'YouTube video'}
          />

          {/* Video Badge */}
          <div className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {shouldPlay ? '▶ PLAYING' : '⏸ PAUSED'}
          </div>
        </>
      )}

      {/* Caption */}
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pointer-events-none">
          <p className="text-xs text-white line-clamp-2">{caption}</p>
        </div>
      )}
    </div>
  );
});

YouTubeVideo.displayName = 'YouTubeVideo';

export default YouTubeVideo;
