import { useEffect, useState, useCallback } from "react";

/**
 * Custom hook to detect scroll direction
 * Useful for hiding/showing header on scroll
 */
export type ScrollDirection = "up" | "down" | null;

interface UseScrollDirectionOptions {
  threshold?: number;
}

export function useScrollDirection(
  options: UseScrollDirectionOptions = {}
): ScrollDirection {
  const { threshold = 10 } = options;
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);

  const handleScroll = useCallback(() => {
    try {
      const currentScrollY = window.scrollY;
      const lastScrollY = parseInt(
        sessionStorage.getItem("lastScrollY") || "0",
        10
      );

      if (Math.abs(currentScrollY - lastScrollY) < threshold) {
        return;
      }

      if (currentScrollY > lastScrollY) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }

      sessionStorage.setItem("lastScrollY", currentScrollY.toString());
    } catch (error) {
      console.error("Error in scroll direction handler:", error);
    }
  }, [threshold]);

  useEffect(() => {
    // Initialize last scroll position
    try {
      sessionStorage.setItem("lastScrollY", window.scrollY.toString());
    } catch (error) {
      console.error("Error initializing scroll position:", error);
    }

    // Add scroll listener with passive for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return scrollDirection;
}
