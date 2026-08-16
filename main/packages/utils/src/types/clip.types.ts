import { z } from "zod";

import { CLIP_MODES } from "../lib/clip-config";

export const aspectRatioIdSchema = z.enum(["16:9", "9:16", "1:1", "4:5"]);
export const clipModeSchema = z.enum(CLIP_MODES);
export const clipSourceSchema = z.enum(["youtube", "upload"]);

export const youtubeUrlSchema = z
  .string()
  .trim()
  .min(1, "Please enter a YouTube URL")
  .refine((value) => {
    try {
      const url = new URL(value);

      const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

      const allowedHosts = [
        "youtube.com",
        "m.youtube.com",
        "youtu.be",
        "youtube-nocookie.com",
      ];

      if (!allowedHosts.includes(hostname)) {
        return false;
      }

      if (hostname === "youtu.be") {
        return url.pathname.length > 1;
      }

      if (hostname === "youtube.com" || hostname === "m.youtube.com") {
        if (url.pathname === "/watch") {
          return Boolean(url.searchParams.get("v"));
        }

        if (
          url.pathname.startsWith("/shorts/") ||
          url.pathname.startsWith("/embed/")
        ) {
          return (url.pathname.split("/")[2] ?? "").length > 0;
        }

        return false;
      }

      if (hostname === "youtube-nocookie.com") {
        return url.pathname.startsWith("/embed/") && (url.pathname.split("/")[2] ?? "")?.length > 0;
      }

      return false;
    } catch {
      return false;
    }
  }, "Please enter a valid YouTube URL");

export const ClipModel = {
  previewBody: z.object({
    url: youtubeUrlSchema,
  }),

  previewResponse: z.object({
    thumbnail: z.string(),
    title: z.string(),
    duration: z.number(),
    videoLanguage: z.string().optional(),
    videoQuality: z.string().optional(),
  }),

  invalidUrl: z.literal("Invalid url"),
  
  // presigned url
  presignedUrlBody: z.object({
    filename: z.string(),
  }),

  presignedUrlResponse: z.object({
    url: z.string(),
    key: z.string(),
    publicUrl: z.string(),
  }),

  invalidFilename: z.literal("Invalid filename"),

  createClipBody: z.object({
    source: clipSourceSchema,
    url: z.string().optional(),
    sourceKey: z.string().optional(),
    from: z.number(),
    to: z.number(),
    subtitles: z.boolean(),
    clipMode: clipModeSchema,
    aspectRatio: aspectRatioIdSchema,
    subtitleTemplateId: z.string().optional(),
    bgMusicTemplateId: z.string().optional(),
    bgMusicIntensity: z.number().min(0).max(100),
    videoTemplateId: z.string().optional(),
    attachedClipId: z.string().optional(),
  }),
} as const;

export type ClipModel = {
  [K in keyof typeof ClipModel]: z.infer<(typeof ClipModel)[K]>;
};

export const sanitizeYoutubeUrl = (value: string) => {
  const parsed = youtubeUrlSchema.safeParse(value);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid YouTube URL");
  }

  const url = new URL(parsed.data);
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

  if (hostname === "youtu.be") {
    const videoId = url.pathname.slice(1).split("/")[0];

    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  if (
    hostname === "youtube.com" ||
    hostname === "m.youtube.com"
  ) {
    if (url.pathname === "/watch") {
      const videoId = url.searchParams.get("v");

      if (!videoId) {
        throw new Error("Could not find a YouTube video ID");
      }

      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    if (url.pathname.startsWith("/shorts/")) {
      const videoId = url.pathname.split("/")[2];

      if (!videoId) {
        throw new Error("Could not find a YouTube video ID");
      }

      return `https://www.youtube.com/shorts/${videoId}`;
    }

    if (url.pathname.startsWith("/embed/")) {
      const videoId = url.pathname.split("/")[2];

      if (!videoId) {
        throw new Error("Could not find a YouTube video ID");
      }

      return `https://www.youtube.com/watch?v=${videoId}`;
    }
  }

  if (hostname === "youtube-nocookie.com") {
    const videoId = url.pathname.split("/")[2];

    if (!videoId) {
      throw new Error("Could not find a YouTube video ID");
    }

    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  throw new Error("Please enter a valid YouTube URL");
};