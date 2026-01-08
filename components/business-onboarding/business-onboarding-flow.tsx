// components/business-onboarding/business-onboarding-flow.tsx
// Main component that orchestrates the entire onboarding flow with premium styling

"use client";

import React from "react";
import {
  useCurrentStep,
  useIsComplete,
} from "@/store/businessOnboarding/business-onboarding.store";
import { ProgressIndicator } from "./progress-indicator";
import { OnboardingSuccess } from "./onboarding-success";
import { Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      <div className="w-full max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-4 border border-primary/20 animate-bounce-slow">
            <Sparkles className="w-4 h-4" />
            Empower Your Business
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 tracking-tight">
            Register Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">Business</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-medium">
            Join the CHWK ecosystem and reach thousands of customers in your locality.
            Complete our simple 8-step verification to get started.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-16">
          <ProgressIndicator />
        </div>

        {/* Step Content */}
        <div className="relative">
          {/* Background Decorative Elements */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10" />

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
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

        {/* Footer Support Info */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
           Need help? Contact our partner support at <span className="text-primary font-bold">support@chwk.in</span>
        </div>
      </div>
    </div>
  );
}
