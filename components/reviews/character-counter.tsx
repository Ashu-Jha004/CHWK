// components/reviews/character-counter.tsx

"use client";

import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  current: number;
  min: number;
  max: number;
  className?: string;
}

/**
 * Character Counter with Visual Feedback
 * Shows green when valid, red when invalid
 */
export function CharacterCounter({
  current,
  min,
  max,
  className = "",
}: CharacterCounterProps) {
  const isValid = current >= min && current <= max;
  const isTooShort = current < min;
  const isTooLong = current > max;
  const percentage = (current / max) * 100;

  // ============================================
  // COLOR LOGIC
  // ============================================
  let colorClass = "text-muted-foreground";
  let progressColor = "bg-muted";

  if (isValid) {
    colorClass = "text-success";
    progressColor = "bg-success";
  } else if (isTooLong) {
    colorClass = "text-destructive";
    progressColor = "bg-destructive";
  } else if (isTooShort && current > 0) {
    colorClass = "text-amber-600";
    progressColor = "bg-amber-600";
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Counter text */}
      <div className="flex items-center justify-between text-xs">
        <span className={colorClass}>
          {isTooShort && current > 0 && `${min - current} more characters needed`}
          {isValid && "✓ Character count valid"}
          {isTooLong && "Character limit exceeded"}
        </span>
        <span className={cn("font-medium", colorClass)}>
          {current} / {max}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", progressColor)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Min requirement hint */}
      {current === 0 && (
        <p className="text-xs text-muted-foreground">
          Minimum {min} characters required
        </p>
      )}
    </div>
  );
}
