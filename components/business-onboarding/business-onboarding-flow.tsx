// components/business-onboarding/business-onboarding-flow.tsx
// Main component that orchestrates the entire onboarding flow

"use client";

import React from "react";
import {
  useCurrentStep,
  useIsComplete,
} from "@/store/businessOnboarding/business-onboarding.store";
import { ProgressIndicator } from "./progress-indicator";
import { OnboardingSuccess } from "./onboarding-success";

// Import all step components
import { Step1BasicInfo } from "./steps/step1-basic-info";
import { Step2Location } from "./steps/step2-location";
import { Step3Categories } from "./steps/step3-categories";
import { Step4BusinessHours } from "./steps/step4-business-hours";
import { Step5BusinessDetails } from "./steps/step5-business-details";
import { Step6Documentation } from "./steps/step6-documentation";
import { Step7Photos } from "./steps/step7-photos";
import { Step8Review } from "./steps/step8-review";

export function BusinessOnboardingFlow() {
  const currentStep = useCurrentStep();
  const isComplete = useIsComplete();

  // If onboarding is complete, show success page
  if (isComplete) {
    return <OnboardingSuccess />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Business Onboarding
        </h1>
        <p className="text-muted-foreground">
          Complete all steps to register your business on CHWK
        </p>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator />

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 1 && <Step1BasicInfo />}
        {currentStep === 2 && <Step2Location />}
        {currentStep === 3 && <Step3Categories />}
        {currentStep === 4 && <Step4BusinessHours />}
        {currentStep === 5 && <Step5BusinessDetails />}
        {currentStep === 6 && <Step6Documentation />}
        {currentStep === 7 && <Step7Photos />}
        {currentStep === 8 && <Step8Review />}
      </div>
    </div>
  );
}
