import type { ClipModel } from "@snipmatic/utils/types";
import { status } from "elysia";

import { S3Service } from "../../config/s3";
import { getVideoInfo } from "../../config/yt-dlp";
import { sanitizeFilename } from "./utils";

export abstract class ClipService {
  static async preview({ url }: ClipModel["previewBody"]) {
    const video = await getVideoInfo(url);
    if (!video) {
      throw status(400, "Invalid url" satisfies ClipModel["invalidUrl"]);
    }

    return video as ClipModel["previewResponse"];
  }

  static async presignedUrl({
    filename,
    userId,
  }: ClipModel["presignedUrlBody"] & { userId: string }) {
    const safeFilename = sanitizeFilename(filename);
    const key = `raw/${userId}/${crypto.randomUUID()}-${safeFilename}`;
    const url = await S3Service.presignedUrl({
      filename: safeFilename,
      filepath: key,
    });
    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { url, key, publicUrl } satisfies ClipModel["presignedUrlResponse"];
  }

  static async process(payload: ClipModel["processClipBody"] & { userId: string }) {
    return { clips: [] } satisfies ClipModel["processClipResponse"];
  }
}
