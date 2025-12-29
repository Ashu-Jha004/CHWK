import { z } from "zod";
import { DayOfWeek } from "@prisma/client";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Use .catch("") to ensure the value is ALWAYS a string, never undefined
const timeSchema = z
  .string()
  .catch("")
  .refine((val) => val === "" || timeRegex.test(val), {
    message: "Invalid time format (use HH:MM)",
  });

export const dayScheduleSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  isClosed: z.boolean(),
  openTime: timeSchema,
  closeTime: timeSchema,
  hasSplitShift: z.boolean(),
  splitCloseTime: timeSchema,
  splitReopenTime: timeSchema,
});

// We cast the schema to ensure the Resolver sees it as a strict object
export const businessHoursSchema = z.object({
  is24x7: z.boolean(),
  hours: z.array(dayScheduleSchema).length(7),
});

export type BusinessHoursFormData = z.infer<typeof businessHoursSchema>;
export type DayScheduleFormData = z.infer<typeof dayScheduleSchema>;
