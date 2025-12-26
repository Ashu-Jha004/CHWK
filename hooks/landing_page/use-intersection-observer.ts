import { useEffect, useRef, useState} from "react";

/**
 * Options for Intersection Observer
 */
interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

/**
 * Custom hook for Intersection Observer API
 * Used for lazy loading and scroll animations
 * Performance optimized with proper cleanup
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = "0px",
    freezeOnceVisible = false,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<Element | null>(null);

  // We use a local variable inside useEffect for the observer
  // to avoid mutating a ref that triggers the immutability rule.
  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      const isElementIntersecting = entry.isIntersecting;

      setIsIntersecting(isElementIntersecting);

      if (isElementIntersecting) {
        setHasIntersected(true);
        // If we only want to trigger once, unobserve immediately
        if (freezeOnceVisible) {
          observer.unobserve(currentElement);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold,
      root,
      rootMargin,
    });

    observer.observe(currentElement);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible]); // Dependencies

  return {
    ref: elementRef,
    isIntersecting,
    hasIntersected,
  };
}

/**
 * Simpler hook for basic visibility detection
 */
export function useIsVisible(options?: UseIntersectionObserverOptions) {
  const { ref, isIntersecting } = useIntersectionObserver({
    ...options,
    freezeOnceVisible: true,
  });

  return { ref, isVisible: isIntersecting };
}
