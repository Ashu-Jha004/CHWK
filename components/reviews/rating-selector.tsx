// components/reviews/rating-selector.tsx

"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface RatingSelectorProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  required?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Star Rating Selector Component
 * Accessible, keyboard-navigable, and mobile-friendly
 */
export function RatingSelector({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  size = "md",
  className = "",
}: RatingSelectorProps) {
  const [hoverValue, setHoverValue] = useState(0);

  // ============================================
  // SIZE VARIANTS
  // ============================================
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const starSize = sizeClasses[size];

  // ============================================
  // HANDLERS
  // ============================================
  const handleClick = (rating: number) => {
    if (disabled) return;
    onChange(rating);
  };

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(rating);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHoverValue(0)}
        role="radiogroup"
        aria-label={label}
        aria-required={required}
      >
        {[1, 2, 3, 4, 5].map((rating) => {
          const isActive = hoverValue ? rating <= hoverValue : rating <= value;

          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => setHoverValue(rating)}
              onKeyDown={(e) => handleKeyDown(e, rating)}
              disabled={disabled}
              className={cn(
                "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              aria-label={`${rating} star${rating !== 1 ? "s" : ""}`}
              role="radio"
              aria-checked={rating === value}
              tabIndex={disabled ? -1 : 0}
            >
              <Star
                className={cn(
                  starSize,
                  "transition-all duration-200",
                  isActive
                    ? "fill-primary text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              />
            </button>
          );
        })}

        {/* Rating value display */}
        {value > 0 && (
          <span className="ml-2 text-sm font-medium text-foreground">
            {value}/5
          </span>
        )}
      </div>
    </div>
  );
}
