// app/business/dashboard/_components/day-schedule-card.tsx
"use client";

import { useState, useMemo } from "react";
import { DayOfWeek } from "@prisma/client";
import { ChevronDown, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TimePicker } from "./time-picker";
import { FormField } from "./form-field";
import { cn } from "@/lib/utils";
import { DayScheduleFormData } from "@/lib/validations/business-dashboard/profile/business-hours";

interface DayScheduleCardProps {
  day: DayOfWeek;
  schedule: DayScheduleFormData;
  onChange: (schedule: DayScheduleFormData) => void;
  onCopy?: (schedule: DayScheduleFormData) => void;
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
  const [isExpanded, setIsExpanded] = useState(!schedule.isClosed);

  const handleToggleClosed = (isClosed: boolean) => {
    onChange({
      ...schedule,
      isClosed,
      openTime: isClosed ? null : schedule.openTime,
      closeTime: isClosed ? null : schedule.closeTime,
      hasSplitShift: isClosed ? false : schedule.hasSplitShift,
      splitCloseTime: null,
      splitReopenTime: null,
    });
    setIsExpanded(!isClosed);
  };

  const handleToggleSplitShift = (hasSplitShift: boolean) => {
    onChange({
      ...schedule,
      hasSplitShift,
      splitCloseTime: hasSplitShift ? schedule.splitCloseTime : null,
      splitReopenTime: hasSplitShift ? schedule.splitReopenTime : null,
    });
  };

  // Generate summary text
  const summaryText = useMemo(() => {
    if (schedule.isClosed) return "Closed";
    if (!schedule.openTime || !schedule.closeTime) return "Set hours";

    if (
      schedule.hasSplitShift &&
      schedule.splitCloseTime &&
      schedule.splitReopenTime
    ) {
      return `${schedule.openTime} - ${schedule.splitCloseTime}, ${schedule.splitReopenTime} - ${schedule.closeTime}`;
    }

    return `${schedule.openTime} - ${schedule.closeTime}`;
  }, [schedule]);

  return (
    <div
      className={cn(
        "glass rounded-lg border transition-all duration-200",
        schedule.isClosed
          ? "border-border bg-muted/30"
          : "border-primary/20 bg-background"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            title="input"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "p-1 rounded hover:bg-muted transition-colors",
              schedule.isClosed && "opacity-50"
            )}
            disabled={schedule.isClosed}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </button>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold">{dayLabels[day]}</h4>
            <p
              className={cn(
                "text-sm truncate",
                schedule.isClosed ? "text-muted-foreground" : "text-primary"
              )}
            >
              {summaryText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onCopy && !schedule.isClosed && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onCopy(schedule)}
              title="Copy to all days"
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Closed</span>
            <Switch
              checked={schedule.isClosed}
              onCheckedChange={handleToggleClosed}
            />
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && !schedule.isClosed && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          {/* Regular Hours */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Opening Time" required error={errors?.openTime}>
              <TimePicker
                value={schedule.openTime || ""}
                onChange={(value) =>
                  onChange({ ...schedule, openTime: value || null })
                }
                placeholder="09:00"
                error={!!errors?.openTime}
              />
            </FormField>

            <FormField label="Closing Time" required error={errors?.closeTime}>
              <TimePicker
                value={schedule.closeTime || ""}
                onChange={(value) =>
                  onChange({ ...schedule, closeTime: value || null })
                }
                placeholder="21:00"
                error={!!errors?.closeTime}
              />
            </FormField>
          </div>

          {/* Split Shift Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Split Shift</p>
              <p className="text-xs text-muted-foreground">
                For businesses with lunch breaks
              </p>
            </div>
            <Switch
              checked={schedule.hasSplitShift}
              onCheckedChange={handleToggleSplitShift}
            />
          </div>

          {/* Split Shift Times */}
          {schedule.hasSplitShift && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border border-dashed border-border">
              <FormField
                label="Break Starts"
                required
                error={errors?.splitCloseTime}
              >
                <TimePicker
                  value={schedule.splitCloseTime || ""}
                  onChange={(value) =>
                    onChange({ ...schedule, splitCloseTime: value || null })
                  }
                  placeholder="13:00"
                  error={!!errors?.splitCloseTime}
                />
              </FormField>

              <FormField
                label="Break Ends"
                required
                error={errors?.splitReopenTime}
              >
                <TimePicker
                  value={schedule.splitReopenTime || ""}
                  onChange={(value) =>
                    onChange({ ...schedule, splitReopenTime: value || null })
                  }
                  placeholder="14:00"
                  error={!!errors?.splitReopenTime}
                />
              </FormField>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
