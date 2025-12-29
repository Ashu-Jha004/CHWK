// lib/validations/business-dashboard/profile/business-hours.ts
import { z } from "zod";
import { DayOfWeek } from "@prisma/client";

// Day schedule schema
export const dayScheduleSchema = z
  .object({
    dayOfWeek: z.nativeEnum(DayOfWeek),
    isClosed: z.boolean(),
    openTime: z.string(), // Required, but can be empty string
    closeTime: z.string(), // Required, but can be empty string
    hasSplitShift: z.boolean(),
    splitCloseTime: z.string(), // Required, but can be empty string
    splitReopenTime: z.string(), // Required, but can be empty string
  })
  .refine(
    (data) => {
      // If closed, no validation needed
      if (data.isClosed) return true;

      // If open, must have openTime and closeTime
      if (!data.openTime || !data.closeTime) return false;

      // Close time must be after open time
      return data.closeTime > data.openTime;
    },
    {
      message: "Close time must be after open time",
      path: ["closeTime"],
    }
  )
  .refine(
    (data) => {
      // If no split shift, no validation needed
      if (!data.hasSplitShift) return true;

      // If split shift, must have both times
      if (!data.splitCloseTime || !data.splitReopenTime) return false;

      // Split reopen must be after split close
      return data.splitReopenTime > data.splitCloseTime;
    },
    {
      message: "Break end time must be after break start time",
      path: ["splitReopenTime"],
    }
  )
  .refine(
    (data) => {
      // If no split shift, no validation needed
      if (!data.hasSplitShift) return true;

      // Split close must be after open time
      if (!data.openTime || !data.splitCloseTime) return false;
      return data.splitCloseTime > data.openTime;
    },
    {
      message: "Break start must be after opening time",
      path: ["splitCloseTime"],
    }
  )
  .refine(
    (data) => {
      // If no split shift, no validation needed
      if (!data.hasSplitShift) return true;

      // Split reopen must be before close time
      if (!data.closeTime || !data.splitReopenTime) return false;
      return data.splitReopenTime < data.closeTime;
    },
    {
      message: "Break end must be before closing time",
      path: ["splitReopenTime"],
    }
  );

// Main business hours schema
export const businessHoursSchema = z.object({
  is24x7: z.boolean(),
  hours: z.array(dayScheduleSchema),
});

// TypeScript types
export type DayScheduleFormData = z.infer<typeof dayScheduleSchema>;
export type BusinessHoursFormData = z.infer<typeof businessHoursSchema>;
