// components/business-onboarding/onboarding-success.tsx
// Success page after onboarding completion

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusinessOnboardingStore } from "@/store/businessOnboarding/business-onboarding.store";

export function OnboardingSuccess() {
  const router = useRouter();
  const { basicInfo, resetForm } = useBusinessOnboardingStore();

  const handleGoToDashboard = () => {
    // Reset the form
    resetForm();

    // Navigate to dashboard
    router.push("/business/dashboard");
  };

  const handleGoHome = () => {
    resetForm();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-card border rounded-2xl p-8 md:p-12 text-center shadow-lg">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            🎉 Congratulations!
          </h1>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Your Business Registration is Complete
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {basicInfo.name ? (
              <>
                <span className="font-semibold text-foreground">
                  {basicInfo.name}
                </span>{" "}
                has been successfully submitted for review. We&apos;ll notify
                you once it&apos;s approved.
              </>
            ) : (
              "Your business has been successfully submitted for review."
            )}
          </p>

          {/* What's Next */}
          <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-foreground mb-3">
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>
                  Our team will review your application within 24-48 hours
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>
                  You&apos;ll receive an email notification once approved
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>After approval, your business will be live on CHWK</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>You can manage your business from the dashboard</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGoToDashboard} size="lg" className="gap-2">
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>

          {/* Support */}
          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <a
                href="/support"
                className="text-primary hover:underline font-medium"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
