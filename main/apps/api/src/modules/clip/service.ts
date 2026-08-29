import { type Status, prisma } from "@snipmatic/db";
import { calculateClipCredits } from "@snipmatic/utils";
import type {
  ClipModel,
  JobModel,
  PresignedUrlModel,
  PreviewModel,
  ProcessModel,
} from "@snipmatic/utils/types";
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
  "GENERATING_CLIPS",
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
      bgMusic: Boolean(payload.bgMusicKey),
      splitLayout: payload.layoutType === "SPLIT_VERTICAL",
    });

    if (estimatedCredits > (userCredits?.billing?.creditsBalance ?? 0)) {
      throw status(
        400,
        "Insufficient credits" satisfies ProcessModel["insufficientCredits"]
      );
    }

    const res = await prisma.$transaction(async (tx) => {
      const job = await tx.job.create({
        data: {
          creditUsage: estimatedCredits,
          source: payload.source,
          sourceKey: payload.sourceKey,
          searchFrom: payload.searchFrom,
          searchTo: payload.searchTo,
          title: payload.title,
          thumbnail: payload.thumbnail,
          userId: payload.userId,
          aspectRatio: payload.aspectRatio,
          bgMusicKey: payload.bgMusicKey,
          clipType: payload.clipType,
          prompt: payload.prompt,
          bgMusicIntensity: payload.bgMusicIntensity,
          subtitleStyleKey: payload.subtitleStyleKey,
        },
      });

      if (payload.clipType === "MANUAL") {
        await tx.clip.create({
          data: {
            jobId: job.id,
            from: payload.searchFrom ?? 0,
            to: payload.searchTo ?? payload.duration,
            duration: payload.duration,
            aspectRatio: payload.aspectRatio,
            subtitleStyleKey: payload.subtitleStyleKey,
            bgMusicKey: payload.bgMusicKey,
            bgMusicIntensity: payload.bgMusicIntensity,
            layoutType: payload.layoutType ?? "SINGLE",
            secondaryVideoKey: payload.secondaryVideoKey,
            title: payload.title,
            thumbnail: payload.thumbnail,
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
          jobId: job.id,
          metadata: {
            source: payload.source,
            sourceKey: payload.sourceKey,
            searchFrom: payload.searchFrom,
            searchTo: payload.searchTo,
            title: payload.title,
            thumbnail: payload.thumbnail,
          },
        },
      });

      return { job };
    });

    await inngest.send({
      name: "process-video",
      data: {
        job: res.job,
      },
    });

    return { job: res.job } satisfies ProcessModel["response"];
  }

  static async get(id: string, userId: string) {
    const job = await prisma.job.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        clips: true,
      },
    });

    if (!job) {
      throw status(404, "Job not found" satisfies JobModel["notFound"]);
    }

    return { job } satisfies JobModel["response"];
  }

  static async list(userId: string, filter: JobModel["listQuery"]["status"]) {
    const jobs = await prisma.job.findMany({
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

    return { jobs } satisfies JobModel["listResponse"];
  }

  static async updateJob(id: string, data: JobModel["updateBody"]) {
    const existing = await prisma.job.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw status(404, "Job not found" satisfies JobModel["notFound"]);
    }

    const job = await prisma.job.update({
      where: { id },
      data,
      include: {
        clips: true,
      },
    });

    return { job } satisfies JobModel["response"];
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
