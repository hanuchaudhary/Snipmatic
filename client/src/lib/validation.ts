import { z } from "zod";
import { PRICING_CONFIG } from "./constants";

export const formSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid video URL")
    .min(1, "URL is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  aspectRatio: z.enum(["original", "vertical", "square"]),
  subtitles: z.boolean(),
  clipType: z.enum(["AI", "MANUAL"]).optional(),
  multipleClips: z.boolean().optional(),
  aiPrompt: z.string().optional(),
});


export const creditPackageSchema = z.object({
  credits: z.number().min(PRICING_CONFIG.MIN_CREDITS, `Minimum ${PRICING_CONFIG.MIN_CREDITS} credits required`),
  currency: z.enum(["INR", "USD"]).optional().default("INR"),
});
