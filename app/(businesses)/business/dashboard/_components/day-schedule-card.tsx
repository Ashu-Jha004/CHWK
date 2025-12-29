// app/business/dashboard/_components/day-schedule-card.tsx
"use client";

import { DayOfWeek } from "@prisma/client";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Clock } from "lucide-react";
import { DayScheduleFormData } from "@/lib/validations/business-dashboard/profile/business-hours";
import { cn } from "@/lib/utils";

interface DayScheduleCardProps {
  day: DayOfWeek;
  schedule: DayScheduleFormData;
  onChange: (schedule: DayScheduleFormData) => void;
  onCopy: (schedule: DayScheduleFormData) => void;
  errors?: {
    openTime?: string;
    closeTime?: string;
    splitCloseTime?: string;
    splitReopenTime?: string;
  };
}

const dayLabels: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export function DayScheduleCard({
  day,
  schedule,
  onChange,
  onCopy,
  errors,
}: DayScheduleCardProps) {
  const handleClosedToggle = (isClosed: boolean) => {
    onChange({
      ...schedule,
      isClosed,
      openTime: isClosed ? "" : schedule.openTime,
      closeTime: isClosed ? "" : schedule.closeTime,
      hasSplitShift: isClosed ? false : schedule.hasSplitShift,
      splitCloseTime: "",
      splitReopenTime: "",
    });
  };

  const handleTimeChange = (
    field: keyof DayScheduleFormData,
    value: string
  ) => {
    onChange({
      ...schedule,
      [field]: value,
    });
  };

  const handleSplitShiftToggle = (hasSplitShift: boolean) => {
    onChange({
      ...schedule,
      hasSplitShift,
      splitCloseTime: hasSplitShift ? schedule.splitCloseTime : "",
      splitReopenTime: hasSplitShift ? schedule.splitReopenTime : "",
    });
  };

  return (
    <div className="glass rounded-lg p-4 space-y-4">
      {/* Day Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-semibold text-base">{dayLabels[day]}</h4>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={!schedule.isClosed}
              onCheckedChange={(checked) => handleClosedToggle(!checked)}
            />
            <span className="text-sm text-muted-foreground">
              {schedule.isClosed ? "Closed" : "Open"}
            </span>
          </div>
        </div>

        {!schedule.isClosed && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onCopy(schedule)}
            className="gap-2"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy to All
          </Button>
        )}
      </div>

      {/* Time Fields */}
      {!schedule.isClosed && (
        <div className="space-y-4">
          {/* Main Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Open Time</label>
              <Input
                type="time"
                value={schedule.openTime}
                onChange={(e) => handleTimeChange("openTime", e.target.value)}
                className={cn(errors?.openTime && "border-destructive")}
              />
              {errors?.openTime && (
                <p className="text-xs text-destructive">{errors.openTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Close Time</label>
              <Input
                type="time"
                value={schedule.closeTime}
                onChange={(e) => handleTimeChange("closeTime", e.target.value)}
                className={cn(errors?.closeTime && "border-destructive")}
              />
              {errors?.closeTime && (
                <p className="text-xs text-destructive">{errors.closeTime}</p>
              )}
            </div>
          </div>

          {/* Split Shift Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Switch
              checked={schedule.hasSplitShift}
              onCheckedChange={handleSplitShiftToggle}
            />
            <label className="text-sm text-muted-foreground">
              Split Shift (e.g., lunch break)
            </label>
          </div>

          {/* Split Shift Times */}
          {schedule.hasSplitShift && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Break Start</label>
                <Input
                  type="time"
                  value={schedule.splitCloseTime}
                  onChange={(e) =>
                    handleTimeChange("splitCloseTime", e.target.value)
                  }
                  className={cn(errors?.splitCloseTime && "border-destructive")}
                />
                {errors?.splitCloseTime && (
                  <p className="text-xs text-destructive">
                    {errors.splitCloseTime}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Break End</label>
                <Input
                  type="time"
                  value={schedule.splitReopenTime}
                  onChange={(e) =>
                    handleTimeChange("splitReopenTime", e.target.value)
                  }
                  className={cn(
                    errors?.splitReopenTime && "border-destructive"
                  )}
                />
                {errors?.splitReopenTime && (
                  <p className="text-xs text-destructive">
                    {errors.splitReopenTime}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
