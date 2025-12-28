// components/business-onboarding/progress-indicator.tsx
// Progress bar showing current step (Updated for 8 steps)

"use client";

import React from "react";
import { Check } from "lucide-react";
import {
  useCurrentStep,
  useCompletedSteps,
} from "@/store/businessOnboarding/business-onboarding.store";
import { ONBOARDING_STEPS } from "@/types/businessOnboarding/business-onboarding.types";
import { cn } from "@/lib/utils";

export function ProgressIndicator() {
  const currentStep = useCurrentStep();
  const completedSteps = useCompletedSteps();

  return (
    <div className="w-full">
      {/* Desktop Progress Bar */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${
                  ((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100
                }%`,
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {ONBOARDING_STEPS.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = completedSteps.includes(stepNumber);
              const isCurrent = currentStep === stepNumber;
              const isUpcoming = stepNumber > currentStep;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / ONBOARDING_STEPS.length}%` }}
                >
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 bg-background",
                      isCompleted && "bg-primary border-primary text-white",
                      isCurrent && "border-primary text-primary scale-110",
                      isUpcoming && "border-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">
                        {stepNumber}
                      </span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <p
                      className={cn(
                        "text-xs font-medium transition-colors",
                        (isCompleted || isCurrent) && "text-foreground",
                        isUpcoming && "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Step {currentStep} of {ONBOARDING_STEPS.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {ONBOARDING_STEPS[currentStep - 1].title}
            </p>
          </div>
          <div className="text-sm font-semibold text-primary">
            {Math.round((currentStep / ONBOARDING_STEPS.length) * 100)}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${(currentStep / ONBOARDING_STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
