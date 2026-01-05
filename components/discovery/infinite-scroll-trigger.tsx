// components/discovery/infinite-scroll-trigger.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

/**
 * Infinite Scroll Trigger Component
 * Detects when user scrolls near bottom and triggers load more
 */
export default function InfiniteScrollTrigger({
  onLoadMore,
  hasMore,
  isLoading,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!triggerRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px', // Trigger 200px before reaching the element
      }
    );

    observer.observe(triggerRef.current);

    return () => {
      if (triggerRef.current) {
        observer.unobserve(triggerRef.current);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  if (!hasMore && !isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">
          🎉
        </div>
        <p className="text-lg font-medium text-foreground">
          You&apos;ve seen it all!
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          No more businesses to show in this area
        </p>
      </div>
    );
  }

  return (
    <div ref={triggerRef} className="py-12">
      {isLoading && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading more businesses...</p>
        </div>
      )}
    </div>
  );
}
