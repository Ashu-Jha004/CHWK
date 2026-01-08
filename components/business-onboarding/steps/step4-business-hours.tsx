/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/business-onboarding/steps/step4-business-hours.tsx
// Step 4: Business operating hours with premium orange theme

"use client";

import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Sun, Moon, AlertCircle, Copy, CheckCircle2, CalendarDays } from "lucide-react";
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
import { toast } from "sonner";

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
    toast.success(`Schedule copied to all days!`);
  };

  const handle24x7Toggle = (checked: boolean) => {
    setIs24x7(checked);
    setHasModified(true);
    toast.info(checked ? "24/7 Mode Active" : "Custom Schedule Mode active");
  };

  const hasValidHours = hours.some(
    (h) => !h.isClosed && h.openTime && h.closeTime
  );
  const canProceed = is24x7 || (hasModified && hasValidHours);

  const onSubmit: SubmitHandler<BusinessHoursFormData> = async (data) => {
    try {
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

      const validation = businessHoursSchema.safeParse(cleanedData);
      if (!validation.success) {
        toast.error("Please fix opening/closing time errors.");
        return;
      }

      updateBusinessHours(cleanedData);
      markStepComplete(4);
      toast.success("Schedule saved! Now let's refine your offerings.");
      nextStep();
    } catch (error) {
      console.error("[Step 4] Error:", error);
      toast.error("Failed to save schedule.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <StepWrapper
        title="Operating Schedule"
        description="Customers need to know when they can visit or contact you. Set your rhythm here."
        step={4}
      >
        {/* 24x7 Toggle */}
        <FormSection title="Full-Time Availability">
          <div className={cn(
             "flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-500",
             is24x7 ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "bg-muted/30 border-border"
          )}>
            <div className="space-y-1">
              <Label className="text-xl font-black flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  is24x7 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  <Clock className="w-6 h-6" />
                </div>
                Always Open (24/7)
              </Label>
              <p className="text-sm text-muted-foreground font-medium pl-11">
                Enable for hospitals, gas stations, or emergency services.
              </p>
            </div>
            <Switch
              checked={is24x7}
              onCheckedChange={handle24x7Toggle}
              className="data-[state=checked]:bg-primary scale-125"
            />
          </div>

          {!canProceed && hasModified && !is24x7 && (
            <div className="mt-6 p-4 bg-destructive/5 border-2 border-destructive/20 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
               <AlertCircle className="h-5 w-5 text-destructive" />
               <p className="text-sm font-bold text-destructive">Please set hours for at least one operating day.</p>
            </div>
          )}
        </FormSection>

        {/* Daily Hours (hidden if 24x7) */}
        {!is24x7 && (
          <FormSection title="Custom Weekly Rhythm">
            <div className="space-y-4">
              {hours.map((dayHour, index) => {
                const dayInfo = DAYS_OF_WEEK[index];
                const isOpen = !dayHour.isClosed;

                return (
                  <div
                    key={dayHour.dayOfWeek}
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all duration-300",
                      !isOpen
                        ? "bg-muted/20 border-border/50 grayscale opacity-60"
                        : "bg-background border-primary/20 shadow-lg shadow-primary/5"
                    )}
                  >
                    {/* Day Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all duration-500",
                            !isOpen
                              ? "bg-muted text-muted-foreground"
                              : "bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg shadow-primary/20"
                          )}
                        >
                          {dayInfo.short}
                        </div>
                        <div>
                          <h4 className="font-black text-xl text-foreground tracking-tight">
                            {dayInfo.label}
                          </h4>
                          <p className={cn(
                            "text-xs font-bold",
                            !isOpen ? "text-muted-foreground" : "text-primary"
                          )}>
                            {isOpen ? "Operating Today" : "Closed / Holiday"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl">
                        <div className="flex items-center gap-3 px-3">
                          <Label
                            htmlFor={`closed-${dayHour.dayOfWeek}`}
                            className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                          >
                            Closed
                          </Label>
                          <Switch
                            id={`closed-${dayHour.dayOfWeek}`}
                            checked={dayHour.isClosed}
                            onCheckedChange={(checked) =>
                              updateDayHours(index, { isClosed: checked })
                            }
                            className="data-[state=checked]:bg-muted-foreground"
                          />
                        </div>

                        {isOpen && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToAllDays(index)}
                            className="h-8 gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all"
                          >
                            <Copy className="w-3 h-3" />
                            Apply Everywhere
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Time Inputs */}
                    {isOpen && (
                      <div className="space-y-6 animate-in slide-in-from-top-2 duration-500">
                        {/* Regular Hours */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Opening Time</Label>
                             <div className="relative group">
                              <Sun className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500 group-focus-within:animate-spin-slow" />
                              <Input
                                type="time"
                                value={dayHour.openTime}
                                onChange={(e) =>
                                  updateDayHours(index, {
                                    openTime: e.target.value,
                                  })
                                }
                                className="pl-12 h-14 border-2 rounded-2xl font-black text-lg focus:border-primary focus:ring-primary/10 transition-all"
                              />
                             </div>
                           </div>

                           <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Closing Time</Label>
                             <div className="relative group">
                              <Moon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
                              <Input
                                type="time"
                                value={dayHour.closeTime}
                                onChange={(e) =>
                                  updateDayHours(index, {
                                    closeTime: e.target.value,
                                  })
                                }
                                className="pl-12 h-14 border-2 rounded-2xl font-black text-lg focus:border-primary focus:ring-primary/10 transition-all"
                              />
                             </div>
                           </div>
                        </div>

                        {/* Split Shift Toggle */}
                        <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-2xl border-2 border-dashed">
                          <Switch
                            id={`split-${dayHour.dayOfWeek}`}
                            checked={dayHour.hasSplitShift}
                            onCheckedChange={(checked) =>
                              updateDayHours(index, { hasSplitShift: checked })
                            }
                          />
                          <Label htmlFor={`split-${dayHour.dayOfWeek}`} className="text-sm font-bold cursor-pointer">
                            Enable Afternoon Break / Split Shift
                          </Label>
                        </div>

                        {/* Split Shift Times */}
                        {dayHour.hasSplitShift && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-primary/5 rounded-3xl border-2 border-primary/10 animate-in zoom-in-95 duration-500">
                             <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Break Starts</Label>
                               <Input
                                  type="time"
                                  value={dayHour.splitCloseTime}
                                  onChange={(e) =>
                                    updateDayHours(index, {
                                      splitCloseTime: e.target.value,
                                    })
                                  }
                                  className="h-12 border-2 rounded-xl font-bold focus:border-primary transition-all text-center"
                                />
                             </div>

                             <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Resume Operations</Label>
                               <Input
                                  type="time"
                                  value={dayHour.splitReopenTime}
                                  onChange={(e) =>
                                    updateDayHours(index, {
                                      splitReopenTime: e.target.value,
                                    })
                                  }
                                  className="h-12 border-2 rounded-xl font-bold focus:border-primary transition-all text-center"
                                />
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Helper Callout */}
            <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-amber-500/10 border-2 border-primary/20 rounded-3xl flex items-start gap-4">
               <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <CalendarDays className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="font-black text-primary tracking-tight mb-1">Expert Tip</h4>
                 <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                   Set your hours accurately to avoid customer disappointment. Use <strong>Apply Everywhere</strong> to
                   instantly populate your busiest days, then tweak your weekends separately!
                 </p>
               </div>
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
