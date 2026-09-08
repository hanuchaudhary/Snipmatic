import { type ProjectStatus, prisma } from "@snipmatic/db";
import { calculateClipCredits } from "@snipmatic/utils";
import type {
  ClipModel,
  PresignedUrlModel,
  PreviewModel,
  ProcessModel,
  ProjectModel,
} from "@snipmatic/utils/types";
import { status } from "elysia";

import { S3Service } from "../../config/s3";
import { getVideoInfo } from "../../config/yt-dlp";
import { inngest } from "../../inngest";
import { sanitizeFilename } from "./utils";

const PROCESSING_STATUSES: ProjectStatus[] = [
  "QUEUED",
  "DOWNLOADING",
  "PREPROCESSING",
  "TRANSCRIBING",
  "DIARIZING",
  "DETECTING_FACES",
  "TRACKING",
  "ANALYZING",
  "FINDING_CLIPS",
];

export abstract class ClipService {
  static async preview({ url }: PreviewModel["body"]) {
    const video = await getVideoInfo(url);
    if (!video) {
      throw status(400, "Invalid url" satisfies PreviewModel["invalidUrl"]);
    }

    return video as PreviewModel["response"];
  }

  static async presignedUrl({
    filename,
    userId,
  }: PresignedUrlModel["body"] & { userId: string }) {
    const safeFilename = sanitizeFilename(filename);
    const key = `raw/${userId}/${crypto.randomUUID()}-${safeFilename}`;
    const url = await S3Service.presignedUrl({
      filename: safeFilename,
      filepath: key,
    });
    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      url,
      key,
      publicUrl,
    } satisfies PresignedUrlModel["response"];
  }

  static async process(
    payload: ProcessModel["body"] & { userId: string }
  ) {
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
      subtitles: Boolean(payload.subtitleStyleKey),
    });

    if (estimatedCredits > (userCredits?.billing?.creditsBalance ?? 0)) {
      throw status(
        400,
        "Insufficient credits" satisfies ProcessModel["insufficientCredits"]
      );
    }

    const res = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          source: payload.source,
          sourceUrl: payload.sourceUrl,
          sourceKey: payload.sourceKey,
          fromDuration: payload.fromDuration,
          toDuration: payload.toDuration,
          duration: payload.duration,
          title: payload.title,
          thumbnailKey: payload.thumbnailKey,
          userId: payload.userId,
          prompt: payload.prompt,
        },
      });

      if (payload.processingType === "MANUAL") {
        await tx.clip.create({
          data: {
            projectId: project.id,
            processingType: "MANUAL",
            from: payload.fromDuration ?? 0,
            to: payload.toDuration ?? payload.duration,
            duration: payload.duration,
            aspectRatio: payload.aspectRatio,
            subtitleStyleKey: payload.subtitleStyleKey,
            subtitlesEnabled: Boolean(payload.subtitleStyleKey),
            title: payload.title,
            thumbnailKey: payload.thumbnailKey,
          },
        });
      }

      await tx.user.update({
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

      await tx.creditUsage.create({
        data: {
          amount: estimatedCredits,
          userId: payload.userId,
          jobId: project.id,
          metadata: {
            source: payload.source,
            sourceUrl: payload.sourceUrl,
            sourceKey: payload.sourceKey,
            fromDuration: payload.fromDuration,
            toDuration: payload.toDuration,
            title: payload.title,
            thumbnailKey: payload.thumbnailKey,
          },
        },
      });

      return { project };
    });

    await inngest.send({
      name: "process-video",
      data: {
        project: res.project,
        processingType: payload.processingType,
        aspectRatio: payload.aspectRatio,
        subtitleStyleKey: payload.subtitleStyleKey,
      },
    });

    return { project: res.project } satisfies ProcessModel["response"];
  }

  static async get(id: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        clips: true,
      },
    });

    if (!project) {
      throw status(404, "Project not found" satisfies ProjectModel["notFound"]);
    }

    return { project } satisfies ProjectModel["response"];
  }

  static async list(
    userId: string,
    filter: ProjectModel["listQuery"]["status"]
  ) {
    const projects = await prisma.project.findMany({
      where: {
        userId,
        status:
          filter === "COMPLETED"
            ? "COMPLETED"
            : { in: [...PROCESSING_STATUSES] },
      },
      include: {
        clips: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { projects } satisfies ProjectModel["listResponse"];
  }

  static async updateProject(id: string, data: ProjectModel["updateBody"]) {
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw status(404, "Project not found" satisfies ProjectModel["notFound"]);
    }

    const project = await prisma.project.update({
      where: { id },
      data,
      include: {
        clips: true,
      },
    });

    return { project } satisfies ProjectModel["response"];
  }

  static async updateClip(id: string, data: ClipModel["updateBody"]) {
    const existing = await prisma.clip.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw status(404, "Clip not found" satisfies ClipModel["notFound"]);
    }

    const clip = await prisma.clip.update({
      where: { id },
      data,
    });

    return { clip } satisfies ClipModel["response"];
  }
}
