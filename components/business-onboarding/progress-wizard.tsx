// components/business-onboarding/progress-wizard.tsx
// Step progress indicator for onboarding flow

"use client";

import React from "react";
import { Check } from "lucide-react";
import { ONBOARDING_STEPS } from "@/types/businessOnboarding/business-onboarding.types";
import {
  useCurrentStep,
  useCompletedSteps,
  useBusinessOnboardingStore,
} from "@/store/businessOnboarding/business-onboarding.store";
import { cn } from "@/lib/utils";

export function ProgressWizard() {
  const currentStep = useCurrentStep();
  const completedSteps = useCompletedSteps();
  const jumpToStep = useBusinessOnboardingStore((state) => state.jumpToStep);

  const handleStepClick = (stepNumber: number) => {
    // Only allow jumping to completed steps or current step
    if (
      completedSteps.includes(stepNumber - 1) ||
      stepNumber === 1 ||
      stepNumber === currentStep
    ) {
      jumpToStep(stepNumber);
    }
  };

  return (
    <div className="w-full bg-white border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="container-padding py-6">
        {/* Mobile: Compact view */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {ONBOARDING_STEPS.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(
                (completedSteps.length / ONBOARDING_STEPS.length) * 100
              )}
              %
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{
                width: `${
                  (completedSteps.length / ONBOARDING_STEPS.length) * 100
                }%`,
              }}
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {ONBOARDING_STEPS[currentStep - 1].title}
          </p>
        </div>

        {/* Desktop: Full step visualization */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between">
            {ONBOARDING_STEPS.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = completedSteps.includes(stepNumber);
              const isCurrent = currentStep === stepNumber;
              const isClickable =
                completedSteps.includes(stepNumber - 1) || stepNumber === 1;
              const isLast = stepNumber === ONBOARDING_STEPS.length;

              return (
                <React.Fragment key={step.id}>
                  {/* Step Circle */}
                  <div className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => handleStepClick(stepNumber)}
                      disabled={!isClickable && !isCurrent}
                      className={cn(
                        "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                        isCompleted && "bg-primary border-primary text-white",
                        isCurrent &&
                          !isCompleted &&
                          "border-primary bg-white text-primary scale-110",
                        !isCurrent &&
                          !isCompleted &&
                          "border-muted-foreground/30 bg-white text-muted-foreground",
                        (isClickable || isCurrent) &&
                          "cursor-pointer hover:scale-110",
                        !isClickable &&
                          !isCurrent &&
                          "cursor-not-allowed opacity-50"
                      )}
                      aria-label={`Go to ${step.title}`}
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">
                          {stepNumber}
                        </span>
                      )}

                      {/* Pulse animation for current step */}
                      {isCurrent && !isCompleted && (
                        <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75" />
                      )}
                    </button>

                    {/* Step Label */}
                    <div className="mt-2 text-center max-w-[120px]">
                      <p
                        className={cn(
                          "text-xs font-medium transition-colors",
                          isCurrent && "text-primary font-semibold",
                          isCompleted && "text-foreground",
                          !isCurrent && !isCompleted && "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </p>
                      {step.isOptional && (
                        <span className="text-[10px] text-muted-foreground italic">
                          (Optional)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {!isLast && (
                    <div className="flex-1 h-[2px] mx-2 -mt-8 relative">
                      <div className="absolute inset-0 bg-muted-foreground/20" />
                      <div
                        className={cn(
                          "absolute inset-0 bg-primary transition-all duration-500",
                          isCompleted ? "w-full" : "w-0"
                        )}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
