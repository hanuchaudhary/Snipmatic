import z from "zod";

const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
export const youtubeUrlValidation = z.object({
  url: z
    .string()
    .regex(youtubeUrlRegex, "Invalid YouTube URL")
    .refine((url) => {
      const videoId = url.split("v=")[1];
      return videoId && videoId.length === 11;
    }, "Invalid YouTube video ID"),
});
