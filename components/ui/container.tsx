import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  noPadding?: boolean;
}

/**
 * Reusable Container Component
 * Provides consistent max-width and padding
 */
export function Container({
  children,
  className,
  size = "lg",
  noPadding = false,
}: ContainerProps) {
  const sizeClasses = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-7xl",
    xl: "max-w-[1400px]",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full",
        sizeClasses[size],
        !noPadding && "container-padding",
        className
      )}
    >
      {children}
    </div>
  );
}
