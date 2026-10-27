import { z } from "zod";

import { CLIP_MODES } from "../lib/clip-config";

export const aspectRatioIdSchema = z.enum(["16:9", "9:16", "1:1", "4:5"]);
export const processingTypeSchema = z.enum(CLIP_MODES);
export const videoSourceSchema = z.enum(["YOUTUBE", "UPLOAD"]);

export const projectStatusSchema = z.enum([
  "QUEUED",
  "DOWNLOADING",
  "PREPROCESSING",
  "TRANSCRIBING",
  "DIARIZING",
  "DETECTING_FACES",
  "TRACKING",
  "ANALYZING",
  "FINDING_CLIPS",
  "COMPLETED",
  "FAILED",
]);

export const projectListStatusSchema = z.enum(["PROCESSING", "COMPLETED"]);

export const clipSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  from: z.number(),
  to: z.number(),
  duration: z.number(),
  score: z.number().nullable(),
  title: z.string().nullable(),
  subtitlesKey: z.string().nullable(),
  outputKey: z.string(),
  thumbnailKey: z.string().nullable(),
  outputUrl: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  subtitlesUrl: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const projectConfigSchema = z.object({
  projectId: z.string(),
  processingType: processingTypeSchema,
  fromDuration: z.number(),
  toDuration: z.number(),
  duration: z.number(),
  prompt: z.string().nullable(),
  aspectRatio: z.string(),
  subtitlesEnabled: z.boolean(),
  subtitleStyleKey: z.string().nullable(),
});

export const projectMetadataSchema = z.object({
  projectId: z.string(),
  source: videoSourceSchema,
  sourceUrl: z.string().nullable(),
  sourceKey: z.string().nullable(),
  thumbnailKey: z.string().nullable(),
  transcriptKey: z.string().nullable(),
  audioKey: z.string().nullable(),
  proxyKey: z.string().nullable(),
  thumbnailUrl: z.string().nullable().optional(),
});

export const projectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  status: projectStatusSchema,
  progress: z.number(),
  error: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  config: projectConfigSchema,
  metadata: projectMetadataSchema,
});

export const projectWithClipsSchema = projectSchema.extend({
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
    contentType: z.string().optional(),
  }),
  response: z.object({
    url: z.string(),
    key: z.string(),
  }),
  invalidFilename: z.literal("Invalid filename"),
} as const;

export type PresignedUrlModel = ModelTypes<typeof PresignedUrlModel>;

export const ProcessModel = {
  body: z
    .object({
      thumbnailKey: z.string().optional(),
      title: z.string().optional(),

      source: videoSourceSchema,
      sourceUrl: z.string().optional(),
      sourceKey: z.string().optional(),

      fromDuration: z.number().optional(),
      toDuration: z.number().optional(),
      duration: z.number().positive(),

      processingType: processingTypeSchema,
      prompt: z.string().optional(),

      aspectRatio: aspectRatioIdSchema,

      subtitleStyleKey: z.string().optional(),
    })
    .superRefine((value, context) => {
      if (value.source === "YOUTUBE" && !value.sourceUrl) {
        context.addIssue({
          code: "custom",
          path: ["sourceUrl"],
          message: "YouTube URL is required",
        });
      }
      if (value.source === "UPLOAD" && !value.sourceKey) {
        context.addIssue({
          code: "custom",
          path: ["sourceKey"],
          message: "Upload key is required",
        });
      }
      const from = value.fromDuration ?? 0;
      const to = value.toDuration ?? from + value.duration;
      if (
        from < 0 ||
        to <= from ||
        Math.abs(to - from - value.duration) > 0.01
      ) {
        context.addIssue({
          code: "custom",
          path: ["toDuration"],
          message: "Invalid processing range",
        });
      }
    }),
  response: z.object({
    project: projectSchema,
  }),
  error: z.literal("Error processing clip"),
  insufficientCredits: z.literal("Insufficient credits"),
} as const;

export type ProcessModel = ModelTypes<typeof ProcessModel>;

export const ProcessorJobModel = {
  payload: z
    .object({
      projectId: z.string(),
      userId: z.string(),
      source: videoSourceSchema,
      sourceUrl: z.string().nullable(),
      sourceKey: z.string().nullable(),
      processingType: processingTypeSchema,
      fromDuration: z.number().min(0),
      toDuration: z.number().positive(),
      prompt: z.string().nullable(),
      aspectRatio: aspectRatioIdSchema,
      subtitlesEnabled: z.boolean(),
      subtitleStyleKey: z.string().nullable(),
    })
    .superRefine((value, context) => {
      if (value.toDuration <= value.fromDuration) {
        context.addIssue({
          code: "custom",
          path: ["toDuration"],
          message: "Invalid processing range",
        });
      }
      if (value.source === "YOUTUBE" && !value.sourceUrl) {
        context.addIssue({
          code: "custom",
          path: ["sourceUrl"],
          message: "YouTube URL is required",
        });
      }
      if (value.source === "UPLOAD" && !value.sourceKey) {
        context.addIssue({
          code: "custom",
          path: ["sourceKey"],
          message: "Upload key is required",
        });
      }
    }),
} as const;

export type ProcessorJobModel = ModelTypes<typeof ProcessorJobModel>;

export const ProjectModel = {
  params: z.object({
    id: z.string(),
  }),
  notFound: z.literal("Project not found"),
  response: z.object({
    project: projectWithClipsSchema,
  }),
  listQuery: z.object({
    status: projectListStatusSchema,
  }),
  listResponse: z.object({
    projects: z.array(projectWithClipsSchema),
  }),
  updateBody: z.object({
    status: projectStatusSchema.exclude(["COMPLETED"]).optional(),
    progress: z.number().int().min(0).max(100).optional(),
    error: z.string().nullable().optional(),
    transcriptKey: z.string().nullable().optional(),
    audioKey: z.string().nullable().optional(),
    proxyKey: z.string().nullable().optional(),
    thumbnailKey: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
  }),
  completeBody: z.object({
    clips: z
      .array(
        z
          .object({
            from: z.number().min(0),
            to: z.number().positive(),
            outputKey: z.string().trim().min(1),
            duration: z.number().positive().optional(),
            title: z.string().nullable().optional(),
            score: z.number().nullable().optional(),
            thumbnailKey: z.string().nullable().optional(),
            subtitlesKey: z.string().nullable().optional(),
          })
          .refine((clip) => clip.to > clip.from, {
            path: ["to"],
            message: "Clip end must be after start",
          })
      )
      .superRefine((clips, context) => {
        const keys = new Set<string>();
        for (const [index, clip] of clips.entries()) {
          if (keys.has(clip.outputKey)) {
            context.addIssue({
              code: "custom",
              path: [index, "outputKey"],
              message: "Duplicate output key",
            });
          }
          keys.add(clip.outputKey);
        }
      }),
  }),
  completeResponse: z.object({ project: projectWithClipsSchema }),
} as const;

export type ProjectModel = ModelTypes<typeof ProjectModel>;

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
