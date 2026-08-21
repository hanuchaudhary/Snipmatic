import { type Status, prisma } from "@snipmatic/db";
import { calculateClipCredits } from "@snipmatic/utils";
import type { ClipModel } from "@snipmatic/utils/types";
import { status } from "elysia";

import { S3Service } from "../../config/s3";
import { getVideoInfo } from "../../config/yt-dlp";
import { inngest } from "../../inngest";
import { sanitizeFilename } from "./utils";

const PROCESSING_STATUSES: Status[] = [
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
];

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

      const res = await prisma.$transaction(async (tx) => {
        const job = await tx.job.create({
          data: {
            creditUsage: estimatedCredits,
            source: payload.source,
            sourceKey: payload.sourceKey,
            from: payload.from,
            to: payload.to,
            duration: payload.duration,
            title: payload.title,
            thumbnail: payload.thumbnail,
            userId: payload.userId,
            aspectRatio: payload.aspectRatio,
            bgMusicKey: payload.bgMusicKey,
            clipType: payload.clipMode,
            layoutKey: payload.videoLayoutKey,
            subtitlesKey: payload.subtitleStyle,
            prompt: payload.prompt,
          },
        });

        const deductedCredits = await tx.user.update({
          where: {
            id: payload.userId,
          },
          data: {
            billing: {
              update: {
                creditsBalance: {
                  decrement: estimatedCredits,
                },
              },
            },
          },
        });

        const creditTransaction = await tx.creditUsage.create({
          data: {
            amount: estimatedCredits,
            userId: payload.userId,
            jobId: job.id,
            metadata: {
              source: payload.source,
              sourceKey: payload.sourceKey,
              from: payload.from,
              to: payload.to,
              title: payload.title,
              thumbnail: payload.thumbnail,
            },
          },
        });

        return { job, creditTransaction, deductedCredits };
      });

      const result = await inngest.send({
        name: "process-video",
        data: {
          ...res.job,
        },
      });

      console.log(result);

      return { clips: [] } satisfies ClipModel["processClipResponse"];
    } catch (error) {}
    return { clips: [] } satisfies ClipModel["processClipResponse"];
  }

  static async get(id: string, userId: string) {
    const clip = await prisma.job.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!clip) {
      throw status(404, "Clip not found" satisfies ClipModel["clipNotFound"]);
    }

    return { clip } satisfies ClipModel["clipResponse"];
  }

  static async list(userId: string, filter: ClipModel["listQuery"]["status"]) {
    const clips = await prisma.job.findMany({
      where: {
        userId,
        status:
          filter === "COMPLETED"
            ? "COMPLETED"
            : { in: [...PROCESSING_STATUSES] },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { clips } satisfies ClipModel["listResponse"];
  }

  static async update(id: string, data: ClipModel["updateBody"]) {
    const existing = await prisma.job.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw status(404, "Clip not found" satisfies ClipModel["clipNotFound"]);
    }

    const clip = await prisma.job.update({
      where: { id },
      data,
    });

    return { clip } satisfies ClipModel["clipResponse"];
  }
}
