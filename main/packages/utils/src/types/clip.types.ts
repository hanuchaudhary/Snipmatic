import { z } from "zod";

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
    description: z.string(),
    duration: z.number(),
    videoLanguage: z.string().optional(),
    videoQuality: z.string().optional(),
  }),

  invalidUrl: z.literal("Invalid url"),
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