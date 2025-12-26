"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  align?: "left" | "center" | "right";
  className?: string;
  children?: ReactNode;
}

/**
 * Reusable Section Header Component
 * Consistent typography and spacing for all sections
 */
export function SectionHeader({
  title,
  subtitle,
  description,
  badge,
  align = "center",
  className,
  children,
}: SectionHeaderProps) {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 mb-12 md:mb-16",
        alignmentClasses[align],
        className
      )}
    >
      {/* Badge */}
      {badge && (
        <div className="inline-flex">
          <span className="px-4 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
            {badge}
          </span>
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm md:text-base text-primary font-semibold uppercase tracking-wide">
          {subtitle}
        </p>
      )}

      {/* Title */}
      <h2 className="text-responsive-3xl font-bold text-gray-900 max-w-3xl">
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className="text-responsive-base text-gray-600 max-w-2xl leading-relaxed">
          {description}
        </p>
      )}

      {/* Custom children (e.g., CTA buttons) */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
