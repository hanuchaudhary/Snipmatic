import { z } from "zod";

import { CLIP_MODES } from "../lib/clip-config";

export const aspectRatioIdSchema = z.enum(["16:9", "9:16", "1:1", "4:5"]);
export const clipModeSchema = z.enum(CLIP_MODES);
export const clipSourceSchema = z.enum(["YOUTUBE", "UPLOAD"]);
export const clipStatusSchema = z.enum([
  "QUEUED",
  "DOWNLOADING",
  "PREPROCESSING",
  "TRANSCRIBING",
  "DIARIZING",
  "DETECTING_FACES",
  "TRACKING",
  "ANALYZING",
  "FINDING_CLIPS",
  "GENERATING_SUBTITLES",
  "COMPLETED",
]);
export const clipListStatusSchema = z.enum(["PROCESSING", "COMPLETED"]);

export const clipSchema = z.object({
  id: z.string(),
  status: clipStatusSchema,
  progress: z.number().nullable(),
  from: z.number().nullable(),
  to: z.number().nullable(),
  duration: z.number().nullable(),
  prompt: z.string().nullable(),
  clipType: clipModeSchema,
  source: clipSourceSchema,
  sourceKey: z.string(),
  title: z.string().nullable(),
  thumbnail: z.string().nullable(),
  finalKeys: z.array(z.string()),
  aspectRatio: z.string().nullable(),
  bgMusicKey: z.string().nullable(),
  subtitlesKey: z.string().nullable(),
  layoutKey: z.string().nullable(),
  creditUsage: z.number(),
  error: z.string().nullable(),
  userId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

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
        return (
          url.pathname.startsWith("/embed/") &&
          (url.pathname.split("/")[2] ?? "")?.length > 0
        );
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

  processClipBody: z.object({
    thumbnail: z.string().optional(),
    title: z.string().optional(),

    source: clipSourceSchema,
    sourceKey: z.string(), // s3 key if source is UPLOAD, yt url if source is YOUTUBE

    from: z.number(),
    to: z.number(),
    duration: z.number(),

    clipMode: clipModeSchema,

    subtitles: z.boolean(),
    subtitleStyle: z.string().optional(),
    prompt: z.string().optional(),

    aspectRatio: aspectRatioIdSchema,

    bgMusic: z.boolean(),
    bgMusicKey: z.string().optional(),
    bgMusicIntensity: z.number().min(0).max(100),

    videoLayout: z.boolean(),
    videoLayoutKey: z.string().optional(),
  }),
  processClipResponse: z.object({
    clips: z.array(
      z.object({
        id: z.string(),
        url: z.string(),
        thumbnail: z.string(),
        title: z.string(),
        duration: z.number(),
      })
    ),
  }),
  processClipError: z.literal("Error processing clip"),
  insufficientCredits: z.literal("Insufficient credits"),

  clipIdParams: z.object({
    id: z.string(),
  }),
  clipNotFound: z.literal("Clip not found"),

  clipResponse: z.object({
    clip: clipSchema,
  }),

  listQuery: z.object({
    status: clipListStatusSchema,
  }),
  listResponse: z.object({
    clips: z.array(clipSchema),
  }),

  updateBody: z.object({
    status: clipStatusSchema.optional(),
    progress: z.number().int().min(0).max(100).optional(),
    error: z.string().nullable().optional(),
    finalKeys: z.array(z.string()).optional(),
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

  if (hostname === "youtube.com" || hostname === "m.youtube.com") {
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
