import { prisma } from "@snipmatic/db";
import { calculateClipCredits } from "@snipmatic/utils";
import type { ClipModel } from "@snipmatic/utils/types";
import { status } from "elysia";

import { S3Service } from "../../config/s3";
import { getVideoInfo } from "../../config/yt-dlp";
import { inngest } from "../../inngest";
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

  static async process(
    payload: ClipModel["processClipBody"] & { userId: string }
  ) {
    try {
      const userCredits = await prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
        select: {
          billing: {
            select: {
              creditsBalance: true,
            },
          },
        },
      });

      const estimatedCredits = calculateClipCredits({
        durationSeconds: payload.duration,
        subtitles: payload.subtitles,
        templateId: "", // TODO: Add template id
      });

      if (estimatedCredits > userCredits?.billing?.creditsBalance!) {
        throw status(
          400,
          "Insufficient credits" satisfies ClipModel["insufficientCredits"]
        );
      }

      const result = await inngest.send({
        name: "process-video",
        data: { url: payload.sourceKey },
      });

      console.log(result);
      
      return { clips: [] } satisfies ClipModel["processClipResponse"];
    } catch (error) {}
    return { clips: [] } satisfies ClipModel["processClipResponse"];
  }
}
