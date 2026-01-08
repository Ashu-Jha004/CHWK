// components/business-onboarding/progress-indicator.tsx
// Progress bar showing current step with premium orange theme

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
    <div className="w-full select-none">
      {/* Desktop Progress Bar */}
      <div className="hidden lg:block py-4">
        <div className="relative">
          {/* Progress Line Background */}
          <div className="absolute top-5 left-[5%] right-[5%] h-[2px] bg-muted rounded-full overflow-hidden">
            {/* Progress Line Active */}
            <div
              className="h-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(255,107,0,0.3)]"
              style={{
                width: `${
                  ((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100
                }%`,
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between px-2">
            {ONBOARDING_STEPS.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = completedSteps.includes(stepNumber);
              const isCurrent = currentStep === stepNumber;
              const isUpcoming = stepNumber > currentStep;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center group"
                  style={{ width: `${100 / ONBOARDING_STEPS.length}%` }}
                >
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 bg-background relative z-10",
                      isCompleted && "bg-gradient-to-br from-primary to-orange-600 border-primary text-white shadow-lg shadow-primary/20",
                      isCurrent && "border-primary text-primary scale-125 ring-4 ring-primary/10 shadow-xl",
                      isUpcoming && "border-muted text-muted-foreground group-hover:border-primary/50"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 animate-in zoom-in-50 duration-300" />
                    ) : (
                      <span className={cn(
                        "text-sm font-bold",
                        isCurrent && "animate-pulse"
                      )}>
                        {stepNumber}
                      </span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-4 text-center max-w-[80px]">
                    <p
                      className={cn(
                        "text-[10px] uppercase tracking-wider font-bold transition-all duration-300",
                        (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground",
                        isCurrent && "text-primary scale-110"
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
      <div className="lg:hidden p-4 bg-muted/30 rounded-2xl border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
              {currentStep}
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Step {currentStep} of {ONBOARDING_STEPS.length}
              </p>
              <p className="text-sm font-black text-foreground">
                {ONBOARDING_STEPS[currentStep - 1].title}
              </p>
            </div>
          </div>
          <div className="text-lg font-black text-primary">
            {Math.round((currentStep / ONBOARDING_STEPS.length) * 100)}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden shadow-inner border border-border/50">
          <div
            className="h-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,107,0,0.5)]"
            style={{
              width: `${(currentStep / ONBOARDING_STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
