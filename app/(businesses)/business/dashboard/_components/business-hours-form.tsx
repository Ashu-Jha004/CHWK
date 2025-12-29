"use client";

import { useState, useMemo } from "react";
import {
  useForm,
  useFieldArray,
  SubmitHandler,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Business, BusinessHours, DayOfWeek } from "@prisma/client";
import { Save, Loader2, Clock, Sun, Moon, ChevronDown } from "lucide-react";
import {
  businessHoursSchema,
  BusinessHoursFormData,
  DayScheduleFormData,
} from "@/lib/validations/business-dashboard/profile/business-hours";
import { useUpdateBusinessHours } from "@/hooks/business-dashboard/use-business-hours";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DayScheduleCard } from "./day-schedule-card";
import { showToast } from "@/lib/business-onboarding/toast";
import { cn } from "@/lib/utils";

interface BusinessHoursFormProps {
  business: Business;
  existingHours: BusinessHours[];
}

const daysOfWeek: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export function BusinessHoursForm({
  business,
  existingHours,
}: BusinessHoursFormProps) {
  const mutation = useUpdateBusinessHours(business.id);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Initialize with empty string instead of undefined to satisfy Zod/RHF Resolver
  const initialHours: DayScheduleFormData[] = useMemo(() => {
    return daysOfWeek.map((day) => {
      const existing = existingHours.find(
        (h) => h.dayOfWeek === day && !h.isOverride
      );

      if (existing) {
        return {
          dayOfWeek: day,
          isClosed: existing.isClosed,
          openTime: existing.openTime || "",
          closeTime: existing.closeTime || "",
          hasSplitShift: existing.hasSplitShift,
          splitCloseTime: existing.splitCloseTime || "",
          splitReopenTime: existing.splitReopenTime || "",
        };
      }

      return {
        dayOfWeek: day,
        isClosed: true,
        openTime: "",
        closeTime: "",
        hasSplitShift: false,
        splitCloseTime: "",
        splitReopenTime: "",
      };
    });
  }, [existingHours]);

  const form = useForm<BusinessHoursFormData>({
    resolver: zodResolver(businessHoursSchema),
    defaultValues: {
      is24x7: business.is24x7,
      hours: initialHours,
    },
    mode: "onChange",
  });

  const {
    setValue,
    handleSubmit,
    formState: { errors, isDirty },
    control,
  } = form;

  const { fields, update } = useFieldArray({
    control,
    name: "hours",
  });

  // Use useWatch instead of watch to prevent stale UI / Compiler errors
  const is24x7 = useWatch({
    control,
    name: "is24x7",
  });

  const handleToggle24x7 = (checked: boolean) => {
    setValue("is24x7", checked, { shouldDirty: true });
  };

  const handleCopyToAll = (sourceSchedule: DayScheduleFormData) => {
    fields.forEach((field, index) => {
      update(index, {
        ...field,
        isClosed: sourceSchedule.isClosed,
        openTime: sourceSchedule.openTime,
        closeTime: sourceSchedule.closeTime,
        hasSplitShift: sourceSchedule.hasSplitShift,
        splitCloseTime: sourceSchedule.splitCloseTime,
        splitReopenTime: sourceSchedule.splitReopenTime,
      });
    });
    showToast.success("Hours copied to all days");
  };

  const handleSetAllOpen = () => {
    fields.forEach((field, index) => {
      update(index, {
        ...field,
        isClosed: false,
        openTime: "09:00",
        closeTime: "21:00",
        hasSplitShift: false,
        splitCloseTime: "",
        splitReopenTime: "",
      });
    });
    showToast.success("All days set to open (9 AM - 9 PM)");
  };

  const handleSetAllClosed = () => {
    fields.forEach((field, index) => {
      update(index, {
        ...field,
        isClosed: true,
        openTime: "",
        closeTime: "",
        hasSplitShift: false,
        splitCloseTime: "",
        splitReopenTime: "",
      });
    });
    showToast.success("All days set to closed");
  };

  const handleSetWeekdaysOpen = () => {
    fields.forEach((field, index) => {
      const isWeekday = !["SATURDAY", "SUNDAY"].includes(field.dayOfWeek);
      update(index, {
        ...field,
        isClosed: !isWeekday,
        openTime: isWeekday ? "09:00" : "",
        closeTime: isWeekday ? "18:00" : "",
        hasSplitShift: false,
        splitCloseTime: "",
        splitReopenTime: "",
      });
    });
    showToast.success("Weekdays set to open (9 AM - 6 PM)");
  };

  const onSubmit: SubmitHandler<BusinessHoursFormData> = async (data) => {
    try {
      mutation.mutate(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-full space-y-6"
    >
      {/* 24/7 Toggle Section */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">24/7 Operation</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Enable if your business operates 24 hours a day, 7 days a week
            </p>
          </div>

          <Switch
            checked={is24x7}
            onCheckedChange={handleToggle24x7}
            disabled={mutation.isPending}
          />
        </div>

        {is24x7 && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary font-medium">
              ✓ Your business is marked as always open
            </p>
          </div>
        )}
      </div>

      {/* Weekly Schedule */}
      {!is24x7 && (
        <>
          {/* Quick Actions - FIXED: No nested buttons */}
          <div className="glass rounded-xl p-6 space-y-4">
            <button
              type="button"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center justify-between w-full text-left group"
            >
              <div>
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Set hours for multiple days at once
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                <span className="font-medium">
                  {showQuickActions ? "Hide" : "Show"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    showQuickActions && "rotate-180"
                  )}
                />
              </div>
            </button>

            {showQuickActions && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSetAllOpen}
                  className="gap-2"
                  disabled={mutation.isPending}
                >
                  <Sun className="h-4 w-4" />
                  Set All Open (9-9)
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSetWeekdaysOpen}
                  className="gap-2"
                  disabled={mutation.isPending}
                >
                  <Clock className="h-4 w-4" />
                  Weekdays Only (9-6)
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSetAllClosed}
                  className="gap-2"
                  disabled={mutation.isPending}
                >
                  <Moon className="h-4 w-4" />
                  Set All Closed
                </Button>
              </div>
            )}
          </div>

          {/* Days Schedule */}
          <div className="glass rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Weekly Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Set your business hours for each day of the week
              </p>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <DayScheduleCard
                  key={field.id}
                  day={field.dayOfWeek}
                  schedule={field}
                  onChange={(newSchedule) => update(index, newSchedule)}
                  onCopy={handleCopyToAll}
                  errors={
                    errors.hours?.[index]
                      ? {
                          openTime: errors.hours[index]?.openTime?.message,
                          closeTime: errors.hours[index]?.closeTime?.message,
                          splitCloseTime:
                            errors.hours[index]?.splitCloseTime?.message,
                          splitReopenTime:
                            errors.hours[index]?.splitReopenTime?.message,
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Form Errors */}
      {errors.hours && (
        <div className="glass rounded-xl p-4 bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive font-medium">
            Please fix the errors in your schedule before saving
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {isDirty ? "You have unsaved changes" : "All changes saved"}
        </p>

        <Button
          type="submit"
          disabled={mutation.isPending || !isDirty}
          className={cn(
            "gap-2 w-full sm:w-auto sm:min-w-30",
            mutation.isPending && "cursor-not-allowed"
          )}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
