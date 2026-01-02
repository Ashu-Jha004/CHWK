// lib/validations/video.ts
import { z } from "zod";

/**
 * Regex to validate YouTube URLs (supports standard, shortened, and embed links)
 * Ensures we only accept valid YouTube links.
 */
const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([^&=%\?]{11})/;

export const VideoSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine((val) => youtubeRegex.test(val), {
      message: "Only valid YouTube links are allowed.",
    }),
  caption: z
    .string()
    .max(100, "Caption is too long")
    .optional()
    .or(z.literal("")),
});

export type VideoFormValues = z.infer<typeof VideoSchema>;

/**
 * Utility to extract Video ID for Iframe usage
 * Used for the preview component.
 */
export const getYouTubeID = (url: string): string | null => {
  const match = url.match(youtubeRegex);
  return match ? match[5] : null;
};