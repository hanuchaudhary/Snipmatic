import { z } from "zod";

import { CLIP_MODES } from "../lib/clip-config";

export const aspectRatioIdSchema = z.enum(["16:9", "9:16", "1:1", "4:5"]);
export const clipTypeSchema = z.enum(CLIP_MODES);
export const videoSourceSchema = z.enum(["YOUTUBE", "UPLOAD"]);
export const layoutTypeSchema = z.enum(["SINGLE", "SPLIT_VERTICAL"]);

export const jobStatusSchema = z.enum([
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
  "GENERATING_CLIPS",
  "COMPLETED",
  "FAILED",
]);

export const clipStatusSchema = z.enum([
  "QUEUED",
  "GENERATING_SUBTITLES",
  "RENDERING",
  "COMPLETED",
  "FAILED",
]);

export const jobListStatusSchema = z.enum(["PROCESSING", "COMPLETED"]);

export const clipSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  status: clipStatusSchema,
  from: z.number(),
  to: z.number(),
  aspectRatio: z.string().nullable(),
  subtitleStyleKey: z.string().nullable(),
  bgMusicKey: z.string().nullable(),
  bgMusicIntensity: z.number().nullable(),
  subtitlesKey: z.string().nullable(),
  layoutType: layoutTypeSchema,
  secondaryVideoKey: z.string().nullable(),
  outputKey: z.string().nullable(),
  thumbnail: z.string().nullable(),
  duration: z.number().nullable(),
  score: z.number().nullable(),
  title: z.string().nullable(),
  error: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const jobSchema = z.object({
  id: z.string(),
  status: jobStatusSchema,
  progress: z.number().nullable(),
  clipType: clipTypeSchema,
  source: videoSourceSchema,
  sourceKey: z.string(),
  title: z.string().nullable(),
  thumbnail: z.string().nullable(),
  prompt: z.string().nullable(),
  searchFrom: z.number().nullable(),
  searchTo: z.number().nullable(),
  aspectRatio: z.string().nullable(),
  subtitleStyleKey: z.string().nullable(),
  bgMusicKey: z.string().nullable(),
  bgMusicIntensity: z.number().nullable(),
  creditUsage: z.number(),
  error: z.string().nullable(),
  userId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const jobWithClipsSchema = jobSchema.extend({
  clips: z.array(clipSchema),
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

type ModelTypes<T extends Record<string, z.ZodType>> = {
  [K in keyof T]: z.infer<T[K]>;
};

export const PreviewModel = {
  body: z.object({
    url: youtubeUrlSchema,
  }),
  response: z.object({
    thumbnail: z.string(),
    title: z.string(),
    duration: z.number(),
    videoLanguage: z.string().optional(),
    videoQuality: z.string().optional(),
  }),
  invalidUrl: z.literal("Invalid url"),
} as const;

export type PreviewModel = ModelTypes<typeof PreviewModel>;

export const PresignedUrlModel = {
  body: z.object({
    filename: z.string(),
  }),
  response: z.object({
    url: z.string(),
    key: z.string(),
    publicUrl: z.string(),
  }),
  invalidFilename: z.literal("Invalid filename"),
} as const;

export type PresignedUrlModel = ModelTypes<typeof PresignedUrlModel>;

export const ProcessModel = {
  body: z.object({
    thumbnail: z.string().optional(),
    title: z.string().optional(),

    source: videoSourceSchema,
    sourceKey: z.string(),

    searchFrom: z.number().optional(),
    searchTo: z.number().optional(),
    duration: z.number(),

    clipType: clipTypeSchema,
    prompt: z.string().optional(),

    aspectRatio: aspectRatioIdSchema,

    subtitleStyleKey: z.string().optional(),
    bgMusicKey: z.string().optional(),
    bgMusicIntensity: z.number().min(0).max(100).optional(),

    layoutType: layoutTypeSchema.optional(),
    secondaryVideoKey: z.string().optional(),
  }),
  response: z.object({
    job: jobSchema,
  }),
  error: z.literal("Error processing clip"),
  insufficientCredits: z.literal("Insufficient credits"),
} as const;

export type ProcessModel = ModelTypes<typeof ProcessModel>;

export const JobModel = {
  params: z.object({
    id: z.string(),
  }),
  notFound: z.literal("Job not found"),
  response: z.object({
    job: jobWithClipsSchema,
  }),
  listQuery: z.object({
    status: jobListStatusSchema,
  }),
  listResponse: z.object({
    jobs: z.array(jobWithClipsSchema),
  }),
  updateBody: z.object({
    status: jobStatusSchema.optional(),
    progress: z.number().int().min(0).max(100).optional(),
    error: z.string().nullable().optional(),
  }),
} as const;

export type JobModel = ModelTypes<typeof JobModel>;

export const ClipModel = {
  params: z.object({
    id: z.string(),
  }),
  notFound: z.literal("Clip not found"),
  response: z.object({
    clip: clipSchema,
  }),
  updateBody: z.object({
    status: clipStatusSchema.optional(),
    from: z.number().optional(),
    to: z.number().optional(),
    aspectRatio: z.string().nullable().optional(),
    subtitleStyleKey: z.string().nullable().optional(),
    bgMusicKey: z.string().nullable().optional(),
    bgMusicIntensity: z.number().nullable().optional(),
    subtitlesKey: z.string().nullable().optional(),
    layoutType: layoutTypeSchema.optional(),
    secondaryVideoKey: z.string().nullable().optional(),
    outputKey: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
    duration: z.number().nullable().optional(),
    score: z.number().nullable().optional(),
    title: z.string().nullable().optional(),
    error: z.string().nullable().optional(),
  }),
} as const;

export type ClipModel = ModelTypes<typeof ClipModel>;

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
