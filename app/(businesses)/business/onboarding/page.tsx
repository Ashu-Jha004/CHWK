// app/(dashboard)/business/onboard/page.tsx
// Main business onboarding page

import { Metadata } from "next";
import { BusinessOnboardingFlow } from "@/components/business-onboarding/business-onboarding-flow";

export const metadata: Metadata = {
  title: "Business Onboarding | CHWK",
  description: "Register your business on CHWK",
};

export default function BusinessOnboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <BusinessOnboardingFlow />
    </div>
  );
}
