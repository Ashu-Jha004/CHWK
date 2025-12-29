// lib/hooks/use-mobile.ts
"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/business-dashboard/dashboard-store";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect mobile screen size and update store
 */
export function useMobile() {
  const { isMobile, setIsMobile } = useDashboardStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsMobile]);

  return isMobile;
}
