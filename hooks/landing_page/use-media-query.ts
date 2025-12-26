import { useSyncExternalStore, useCallback } from "react";

/**
 * Custom hook for responsive media queries
 * Uses useSyncExternalStore for better performance and hydration consistency.
 */
export function useMediaQuery(query: string): boolean {
  // 1. Define the subscription logic
  const subscribe = useCallback(
    (callback: () => void) => {
      const matchMedia = window.matchMedia(query);
      matchMedia.addEventListener("change", callback);
      return () => matchMedia.removeEventListener("change", callback);
    },
    [query]
  );

  // 2. Define how to get the current snapshot
  const getSnapshot = () => window.matchMedia(query).matches;

  // 3. Define the server-side fallback (crucial for SSR)
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Common breakpoint hooks
export const useIsMobile = () => useMediaQuery("(max-width: 768px)");
export const useIsTablet = () =>
  useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1025px)");
