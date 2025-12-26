"use client";

import { useIsVisible } from "@/hooks/landing_page/use-intersection-observer";
import { cn } from "@/lib/utils";
import { ReactNode, useRef } from "react";

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
  animationDelay?: number;
  background?: "white" | "gray" | "gradient" | "dark" | "none";
  fullWidth?: boolean;
}

export function SectionWrapper({
  id,
  children,
  className,
  containerClassName,
  animate = true,
  animationDelay = 0,
  background = "white",
  fullWidth = false,
}: SectionWrapperProps) {
  // We use the hook which returns the ref and visibility state
  const { ref, isVisible } = useIsVisible({
    threshold: 0.1,
    freezeOnceVisible: true,
  });

  const backgroundClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    gradient: "bg-gradient-to-br from-gray-50 to-white",
    dark: "bg-gray-900",
    none: "",
  };

  return (
    <section
      id={id}
      // Fix: Cast the ref to any or HTMLElement if your hook's ref type
      // is strictly 'Element', as React's JSX ref is more specific.
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "section-spacing",
        backgroundClasses[background],
        // Only apply animation classes if animate is true AND it is visible
        animate && isVisible
          ? "animate-fade-in-up opacity-100"
          : animate
          ? "opacity-0"
          : "",
        className
      )}
      style={{
        animationDelay: animate ? `${animationDelay}ms` : undefined,
      }}
    >
      {fullWidth ? (
        children
      ) : (
        <div
          className={cn(
            "container mx-auto container-padding",
            containerClassName
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}
