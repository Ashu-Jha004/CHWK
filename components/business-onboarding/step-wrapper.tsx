// components/business-onboarding/step-wrapper.tsx
// Reusable wrapper for each onboarding step

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StepWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  step?: number;
  isOptional?: boolean;
}

export function StepWrapper({
  title,
  description,
  children,
  className,
  step,
  isOptional = false,
}: StepWrapperProps) {
  return (
    <div
      className={cn("w-full max-w-4xl mx-auto animate-fade-in-up", className)}
    >
      <Card className="border-border shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                {step && (
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {step}
                  </span>
                )}
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="text-base text-muted-foreground">
                  {description}
                </CardDescription>
              )}
            </div>
            {isOptional && (
              <span className="px-3 py-1 text-xs font-medium bg-accent/10 text-accent-foreground rounded-full border border-accent/20">
                Optional
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">{children}</CardContent>
      </Card>
    </div>
  );
}
