"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useIsVisible } from "@/hooks/landing_page/use-intersection-observer";
import { formatNumber } from "@/lib/utils";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  startOnView?: boolean;
}

export function AnimatedCounter({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
  decimals = 0,
  className = "",
  startOnView = true,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  // FIX 1: Cast the ref to HTMLSpanElement to satisfy TypeScript
  const { ref, isVisible } = useIsVisible({
    threshold: 0.5,
    freezeOnceVisible: true,
  });

  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const startValue = 0;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);

      const currentValue = startValue + (end - startValue) * easedProgress;

      // Update state for the next frame
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(step);
  }, [end, duration]);

  // FIX 2: Trigger animation without synchronous cascading renders
  useEffect(() => {
    let animationFrameId: number;

    if ((startOnView && isVisible) || !startOnView) {
      // Wrapping in requestAnimationFrame ensures the setState
      // happens after the browser has finished the current paint cycle.
      animationFrameId = requestAnimationFrame(() => {
        animate();
      });
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, startOnView, animate]);

  const displayValue =
    decimals > 0 ? count.toFixed(decimals) : formatNumber(Math.floor(count));

  return (
    <span
      // FIX 1 (Cont): Explicitly cast the ref for the span element
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={className}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
