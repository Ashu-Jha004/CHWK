// components/business-onboarding/step-wrapper.tsx
// Premium reusable wrapper for each onboarding step with orange gradient accents

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
      className={cn("w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700", className)}
    >
      <Card className="border-border/50 shadow-2xl shadow-primary/5 rounded-3xl overflow-hidden bg-background/50 backdrop-blur-sm border-2">
        {/* Top Accent Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-primary via-orange-500 to-amber-500" />

        <CardHeader className="space-y-4 pb-8 pt-10 px-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
               <div className="flex items-center gap-3">
                 {step && (
                    <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-white text-lg font-black shadow-lg shadow-primary/30">
                      {step}
                    </span>
                  )}
                  <CardTitle className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                    {title}
                  </CardTitle>
               </div>
              {description && (
                <CardDescription className="text-lg text-muted-foreground font-medium pl-1">
                  {description}
                </CardDescription>
              )}
            </div>
            {isOptional && (
              <span className="self-start px-4 py-1.5 text-xs font-black uppercase tracking-widest bg-amber-100 text-amber-700 rounded-full border-2 border-amber-200">
                Optional
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pb-12 px-8">
          {children}
        </CardContent>
      </Card>

      {/* Decorative dots or elements could go here */}
      <div className="mt-6 flex justify-center gap-1 opacity-20">
         {[...Array(5)].map((_, i) => (
           <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
         ))}
      </div>
    </div>
  );
}
