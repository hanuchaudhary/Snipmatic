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

// Auth validation schemas
export const signinSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
});

export const registerSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
})

export type SigninFormData = z.infer<typeof signinSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
