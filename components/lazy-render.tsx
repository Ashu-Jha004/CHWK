// components/lazy-render.tsx
"use client";

import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyRenderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function LazyRender({
  children,
  fallback,
  className = "",
  rootMargin = "100px",
  freezeOnceVisible = true,
}: LazyRenderProps) {
  const [ref, isIntersecting] = useIntersectionObserver({
    rootMargin,
    freezeOnceVisible,
    threshold: 0.01,
  });

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? children : (fallback || <LazyRenderSkeleton />)}
    </div>
  );
}

function LazyRenderSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
