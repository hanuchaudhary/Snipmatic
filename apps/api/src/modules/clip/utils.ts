import type { PresignedUrlModel } from "@snipmatic/utils";
import { status } from "elysia";

export const ALLOWED_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".webm",
  ".mkv",
  ".avi",
  ".m4v",
]);

export const sanitizeFilename = (filename: string) => {
  const trimmed = filename.trim();

  if (
    !trimmed ||
    trimmed.includes("..") ||
    trimmed.includes("/") ||
    trimmed.includes("\\")
  ) {
    throw status(
      400,
      "Invalid filename" satisfies PresignedUrlModel["invalidFilename"]
    );
  }

  const extension = trimmed.slice(trimmed.lastIndexOf(".")).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw status(
      400,
      "Invalid filename" satisfies PresignedUrlModel["invalidFilename"]
    );
  }

  return trimmed.replace(/[^a-zA-Z0-9._-]/g, "_");
};
