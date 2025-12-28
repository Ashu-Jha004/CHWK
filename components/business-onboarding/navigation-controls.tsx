// components/business-onboarding/navigation-controls.tsx
// Navigation controls with back button support (Improved)

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface NavigationControlsProps {
  onNext: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  nextLabel?: string;
  backLabel?: string;
  showBack?: boolean;
}

export function NavigationControls({
  onNext,
  onBack,
  isNextDisabled = false,
  isBackDisabled = false,
  nextLabel = "Continue",
  backLabel = "Back",
  showBack = true,
}: NavigationControlsProps) {
  const shouldShowBack = showBack && onBack;

  return (
    <div className="flex items-center justify-between pt-6 border-t">
      {/* Back Button */}
      {shouldShowBack ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isBackDisabled}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel}
        </Button>
      ) : (
        <div /> // Empty div for flexbox alignment
      )}

      {/* Next/Continue Button */}
      <Button
        type="submit"
        onClick={onNext}
        disabled={isNextDisabled}
        className="gap-2 ml-auto"
      >
        {nextLabel}
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
