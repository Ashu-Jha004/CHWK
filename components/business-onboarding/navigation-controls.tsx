// components/business-onboarding/navigation-controls.tsx
// Premium navigation controls with orange theme and integrated store support

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useBusinessOnboardingStore } from "@/store/businessOnboarding/business-onboarding.store";
import { cn } from "@/lib/utils";

export interface NavigationControlsProps {
  onNext: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  nextLabel?: string;
  backLabel?: string;
  showBack?: boolean;
  isSubmitting?: boolean;
}

export function NavigationControls({
  onNext,
  onBack,
  isNextDisabled = false,
  isBackDisabled = false,
  nextLabel = "Continue",
  backLabel = "Back",
  showBack = true,
  isSubmitting = false,
}: NavigationControlsProps) {
  const previousStep = useBusinessOnboardingStore((state) => state.previousStep);
  const currentStep = useBusinessOnboardingStore((state) => state.currentStep);

  // Default back handler if not provided
  const handleBack = onBack || (currentStep > 1 ? previousStep : undefined);
  const shouldShowBack = showBack && handleBack;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 mt-4 border-t border-border/50">
      {/* Back Button */}
      {shouldShowBack ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={isBackDisabled || isSubmitting}
          className="w-full sm:w-auto px-8 h-12 rounded-xl font-bold border-2 hover:bg-muted/50 hover:border-primary/30 transition-all gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel}
        </Button>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Next/Continue Button */}
      <Button
        type="submit"
        onClick={(e) => {
           // If it's a submit button, don't call onNext manually if it's already handled by form onSubmit
           // But actually usually we pass handleSubmit(onSubmit) to onNext
           if (onNext) onNext();
        }}
        disabled={isNextDisabled || isSubmitting}
        className={cn(
          "w-full sm:w-auto sm:ml-auto px-10 h-12 rounded-xl font-bold gap-2 shadow-xl transition-all active:scale-95",
          isNextDisabled
            ? "bg-muted text-muted-foreground grayscale"
            : "bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white hover:shadow-primary/30 hover:-translate-y-0.5"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {nextLabel}
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>

      {/* Form Helper Info */}
      {isNextDisabled && !isSubmitting && (
         <p className="sm:hidden text-[10px] text-muted-foreground text-center italic">
           Please complete all required fields to continue
         </p>
      )}
    </div>
  );
}
