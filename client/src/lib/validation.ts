import { z } from "zod";

export const formSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid video URL")
    .min(1, "URL is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format"),
  aspectRatio: z.enum(["original", "vertical", "square"]),
  subtitles: z.boolean(),
  clipType: z.enum(["AI", "MANUAL"]).optional(),
  multipleClips: z.boolean().optional(),
});
