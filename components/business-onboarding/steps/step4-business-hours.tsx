/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/business-onboarding/steps/step4-business-hours.tsx
// Step 4: Business operating hours with split shift support (Fixed)

"use client";

import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Sun, Moon, AlertCircle } from "lucide-react";
import { DayOfWeek } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  businessHoursSchema,
  type BusinessHoursFormData,
} from "@/lib/validations/business-onboarding.validation";
import {
  useBusinessHours,
  useBusinessOnboardingStore,
} from "@/store/businessOnboarding/business-onboarding.store";
import { StepWrapper } from "../step-wrapper";
import { NavigationControls } from "../navigation-controls";
import { FormField, FormSection } from "../form-fields";
import { cn } from "@/lib/utils";

interface DayHours {
  dayOfWeek: DayOfWeek;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  hasSplitShift: boolean;
  splitCloseTime: string;
  splitReopenTime: string;
}

const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: "MONDAY", label: "Monday", short: "Mon" },
  { value: "TUESDAY", label: "Tuesday", short: "Tue" },
  { value: "WEDNESDAY", label: "Wednesday", short: "Wed" },
  { value: "THURSDAY", label: "Thursday", short: "Thu" },
  { value: "FRIDAY", label: "Friday", short: "Fri" },
  { value: "SATURDAY", label: "Saturday", short: "Sat" },
  { value: "SUNDAY", label: "Sunday", short: "Sun" },
];

const DEFAULT_HOURS: DayHours = {
  dayOfWeek: "MONDAY",
  isClosed: true,
  openTime: "",
  closeTime: "",
  hasSplitShift: false,
  splitCloseTime: "",
  splitReopenTime: "",
};

export function Step4BusinessHours() {
  const businessHours = useBusinessHours();
  const updateBusinessHours = useBusinessOnboardingStore(
    (state) => state.updateBusinessHours
  );
  const nextStep = useBusinessOnboardingStore((state) => state.nextStep);
  const markStepComplete = useBusinessOnboardingStore(
    (state) => state.markStepComplete
  );

  const [is24x7, setIs24x7] = useState(businessHours.is24x7 || false);
  const [hasModified, setHasModified] = useState(
    (businessHours.hours && businessHours.hours.length > 0) ||
      businessHours.is24x7
  );
  const [hours, setHours] = useState<DayHours[]>(() => {
    if (businessHours.hours && businessHours.hours.length > 0) {
      return businessHours.hours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        isClosed: h.isClosed ?? true,
        openTime: h.openTime || "",
        closeTime: h.closeTime || "",
        hasSplitShift: h.hasSplitShift ?? false,
        splitCloseTime: h.splitCloseTime || "",
        splitReopenTime: h.splitReopenTime || "",
      }));
    }
    // Start with all days closed
    return DAYS_OF_WEEK.map((day) => ({
      ...DEFAULT_HOURS,
      dayOfWeek: day.value,
    }));
  });

  const form = useForm<BusinessHoursFormData>({
    resolver: zodResolver(businessHoursSchema),
    mode: "onChange",
    defaultValues: {
      is24x7: businessHours.is24x7 || false,
      hours: hours,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;

  // Auto-save to store
  useEffect(() => {
    const subscription = watch((value) => {
      updateBusinessHours(value as Partial<BusinessHoursFormData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateBusinessHours]);

  // Update form when state changes
  useEffect(() => {
    setValue("is24x7", is24x7);

    // Clean hours data
    const cleanedHours = hours.map((hour) => ({
      dayOfWeek: hour.dayOfWeek,
      isClosed: hour.isClosed,
      hasSplitShift: hour.hasSplitShift,
      openTime: hour.isClosed ? undefined : hour.openTime || undefined,
      closeTime: hour.isClosed ? undefined : hour.closeTime || undefined,
      splitCloseTime:
        hour.hasSplitShift && !hour.isClosed
          ? hour.splitCloseTime || undefined
          : undefined,
      splitReopenTime:
        hour.hasSplitShift && !hour.isClosed
          ? hour.splitReopenTime || undefined
          : undefined,
    }));

    setValue("hours", cleanedHours as any);
  }, [is24x7, hours, setValue]);

  const updateDayHours = (dayIndex: number, updates: Partial<DayHours>) => {
    setHours((prev) => {
      const newHours = [...prev];
      newHours[dayIndex] = { ...newHours[dayIndex], ...updates };
      return newHours;
    });
    setHasModified(true);
  };

  const copyToAllDays = (dayIndex: number) => {
    const sourceDay = hours[dayIndex];
    setHours((prev) =>
      prev.map((day) => ({
        ...day,
        isClosed: sourceDay.isClosed,
        openTime: sourceDay.openTime,
        closeTime: sourceDay.closeTime,
        hasSplitShift: sourceDay.hasSplitShift,
        splitCloseTime: sourceDay.splitCloseTime,
        splitReopenTime: sourceDay.splitReopenTime,
      }))
    );
    setHasModified(true);
  };

  const handle24x7Toggle = (checked: boolean) => {
    setIs24x7(checked);
    setHasModified(true);
  };

  // Check if can proceed
  const hasValidHours = hours.some(
    (h) => !h.isClosed && h.openTime && h.closeTime
  );
  const canProceed = is24x7 || (hasModified && hasValidHours);

  const onSubmit: SubmitHandler<BusinessHoursFormData> = async (data) => {
    try {
      // Clean the data before submission
      const cleanedData = {
        is24x7: data.is24x7,
        hours: data.hours.map((hour) => ({
          dayOfWeek: hour.dayOfWeek,
          isClosed: hour.isClosed,
          hasSplitShift: hour.hasSplitShift,
          openTime: hour.isClosed ? undefined : hour.openTime,
          closeTime: hour.isClosed ? undefined : hour.closeTime,
          splitCloseTime:
            hour.hasSplitShift && !hour.isClosed
              ? hour.splitCloseTime
              : undefined,
          splitReopenTime:
            hour.hasSplitShift && !hour.isClosed
              ? hour.splitReopenTime
              : undefined,
        })),
      };

      console.log("[Step 4] Submitting business hours:", cleanedData);

      // Validate
      const validation = businessHoursSchema.safeParse(cleanedData);
      if (!validation.success) {
        console.error("[Step 4] Validation failed:", validation.error);
        return;
      }

      updateBusinessHours(cleanedData);
      markStepComplete(4);
      nextStep();
    } catch (error) {
      console.error("[Step 4] Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <StepWrapper
        title="Business Hours"
        description="Set your operating hours to let customers know when you're available"
        step={4}
      >
        {/* 24x7 Toggle */}
        <FormSection title="Operating Schedule">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base font-medium flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Open 24 Hours, 7 Days a Week
              </Label>
              <p className="text-sm text-muted-foreground">
                Your business is always open (e.g., hospitals, petrol pumps)
              </p>
            </div>
            <Switch checked={is24x7} onCheckedChange={handle24x7Toggle} />
          </div>

          {/* Show error if not valid */}
          {!canProceed && hasModified && !is24x7 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please set business hours for at least one day
              </AlertDescription>
            </Alert>
          )}

          {errors.hours && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.hours.message}</AlertDescription>
            </Alert>
          )}
        </FormSection>

        {/* Daily Hours (hidden if 24x7) */}
        {!is24x7 && (
          <FormSection title="Set Hours for Each Day">
            <div className="space-y-4">
              {hours.map((dayHour, index) => {
                const dayInfo = DAYS_OF_WEEK[index];
                return (
                  <div
                    key={dayHour.dayOfWeek}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      dayHour.isClosed
                        ? "bg-muted/30 border-muted"
                        : "bg-background border-border"
                    )}
                  >
                    {/* Day Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm",
                            dayHour.isClosed
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {dayInfo.short}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {dayInfo.label}
                          </h4>
                          {dayHour.isClosed && (
                            <p className="text-xs text-muted-foreground">
                              Closed
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`closed-${dayHour.dayOfWeek}`}
                            className="text-sm"
                          >
                            Closed
                          </Label>
                          <Switch
                            id={`closed-${dayHour.dayOfWeek}`}
                            checked={dayHour.isClosed}
                            onCheckedChange={(checked) =>
                              updateDayHours(index, { isClosed: checked })
                            }
                          />
                        </div>

                        {!dayHour.isClosed && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => copyToAllDays(index)}
                            className="text-xs"
                          >
                            Copy to all
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Time Inputs */}
                    {!dayHour.isClosed && (
                      <div className="space-y-4">
                        {/* Regular Hours */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField label="Opening Time">
                            <div className="relative">
                              <Sun className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="time"
                                value={dayHour.openTime}
                                onChange={(e) =>
                                  updateDayHours(index, {
                                    openTime: e.target.value,
                                  })
                                }
                                className="pl-10"
                              />
                            </div>
                          </FormField>

                          <FormField label="Closing Time">
                            <div className="relative">
                              <Moon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="time"
                                value={dayHour.closeTime}
                                onChange={(e) =>
                                  updateDayHours(index, {
                                    closeTime: e.target.value,
                                  })
                                }
                                className="pl-10"
                              />
                            </div>
                          </FormField>
                        </div>

                        {/* Split Shift Toggle */}
                        <div className="flex items-center gap-2 text-sm">
                          <Switch
                            id={`split-${dayHour.dayOfWeek}`}
                            checked={dayHour.hasSplitShift}
                            onCheckedChange={(checked) =>
                              updateDayHours(index, { hasSplitShift: checked })
                            }
                          />
                          <Label htmlFor={`split-${dayHour.dayOfWeek}`}>
                            Has lunch break / split shift
                          </Label>
                        </div>

                        {/* Split Shift Times */}
                        {dayHour.hasSplitShift && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20 animate-fade-in-up">
                            <FormField label="Break Start">
                              <Input
                                type="time"
                                value={dayHour.splitCloseTime}
                                onChange={(e) =>
                                  updateDayHours(index, {
                                    splitCloseTime: e.target.value,
                                  })
                                }
                                placeholder="13:00"
                              />
                            </FormField>

                            <FormField label="Break End">
                              <Input
                                type="time"
                                value={dayHour.splitReopenTime}
                                onChange={(e) =>
                                  updateDayHours(index, {
                                    splitReopenTime: e.target.value,
                                  })
                                }
                                placeholder="14:00"
                              />
                            </FormField>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Helper Text */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Tip:</strong> Use the &quot;Copy to all&quot; button to
                quickly set the same hours for all days, then adjust individual
                days as needed.
              </p>
            </div>
          </FormSection>
        )}
      </StepWrapper>

      {/* Navigation */}
      <NavigationControls
        onNext={handleSubmit(onSubmit)}
        isNextDisabled={!canProceed}
      />
    </form>
  );
}
