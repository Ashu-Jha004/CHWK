"use client";

import React from "react";
import { useBusinessOnboardingStore } from "@/store/businessOnboarding/business-onboarding.store";

export default function SimpleOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Adjust based on your ONBOARDING_STEPS length

  return (
    <div className="min-h-screen">
      {/* 2. Main Content Card */}
      <main className="w-full ">{children}</main>
    </div>
  );
}
