import {
  CreditTransactionType,
  Prisma,
  prisma,
  type ProjectStatus,
} from "@snipmatic/db";
import { calculateClipCredits } from "@snipmatic/utils";
import { ProcessorJobModel } from "@snipmatic/utils/types";
import type {
  PresignedUrlModel,
  PreviewModel,
  ProcessModel,
  ProjectModel,
} from "@snipmatic/utils/types";
import { status } from "elysia";

import { PROCESS_JOB_OPTIONS, processQueue } from "../../config/redis";
import { S3Service } from "../../config/s3";
import { getVideoInfo } from "../../config/yt-dlp";
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

const projectInclude = {
  config: true,
  metadata: true,
  clips: { orderBy: { createdAt: "asc" } },
} as const;

function requireProjectRelations<
  T extends { config: object | null; metadata: object | null },
>(
  project: T
): T & {
  config: NonNullable<T["config"]>;
  metadata: NonNullable<T["metadata"]>;
} {
  if (!project.config || !project.metadata) {
    throw new Error("Project is missing its configuration or metadata");
  }
  return project as T & {
    config: NonNullable<T["config"]>;
    metadata: NonNullable<T["metadata"]>;
  };
}

type CompletedClip = ProjectModel["completeBody"]["clips"][number];

function normalizeClip(clip: CompletedClip) {
  return {
    from: clip.from,
    to: clip.to,
    duration: clip.duration ?? clip.to - clip.from,
    outputKey: clip.outputKey,
    title: clip.title ?? null,
    score: clip.score ?? null,
    thumbnailKey: clip.thumbnailKey ?? null,
    subtitlesKey: clip.subtitlesKey ?? null,
  };
}

function sameClips(
  existing: Array<ReturnType<typeof normalizeClip>>,
  submitted: CompletedClip[]
) {
  const compare = (clips: Array<ReturnType<typeof normalizeClip>>) =>
    JSON.stringify(
      [...clips].sort((a, b) => a.outputKey.localeCompare(b.outputKey))
    );
  return (
    compare(existing.map(normalizeClip)) ===
    compare(submitted.map(normalizeClip))
  );
}

function resolveMediaUrl(key: string | null) {
  if (!key) return null;
  if (/^https?:\/\//i.test(key)) return key;
  return S3Service.downloadUrl(key);
}

function addMediaUrls<
  T extends {
    metadata: { thumbnailKey: string | null };
    clips: Array<{
      outputKey: string;
      thumbnailKey: string | null;
      subtitlesKey: string | null;
    }>;
  },
>(project: T) {
  return {
    ...project,
    metadata: {
      ...project.metadata,
      thumbnailUrl: resolveMediaUrl(project.metadata.thumbnailKey),
    },
    clips: project.clips.map((clip) => ({
      ...clip,
      outputUrl: resolveMediaUrl(clip.outputKey),
      thumbnailUrl: resolveMediaUrl(clip.thumbnailKey),
      subtitlesUrl: resolveMediaUrl(clip.subtitlesKey),
    })),
  };
}

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
    contentType,
    userId,
  }: PresignedUrlModel["body"] & { userId: string }) {
    const safeFilename = sanitizeFilename(filename);
    const key = `raw/${userId}/${crypto.randomUUID()}-${safeFilename}`;
    const url = await S3Service.presignedUrl({
      filename: safeFilename,
      filepath: key,
      contentType,
    });

    return {
      url,
      key,
    } satisfies PresignedUrlModel["response"];
  }

  static async process(payload: ProcessModel["body"] & { userId: string }) {
    const userCredits = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        billing: {
          select: {
            id: true,
            creditsBalance: true,
          },
        },
      },
    });

    const estimatedCredits = calculateClipCredits({
      durationSeconds: payload.duration,
      subtitles: Boolean(payload.subtitleStyleKey),
    });

    const billing = userCredits?.billing;
    if (!billing || estimatedCredits > billing.creditsBalance) {
      throw status(
        400,
        "Insufficient credits" satisfies ProcessModel["insufficientCredits"]
      );
    }

    const res = await prisma.$transaction(async (tx) => {
      const fromDuration = payload.fromDuration ?? 0;
      const toDuration = payload.toDuration ?? fromDuration + payload.duration;
      const project = await tx.project.create({
        data: {
          title: payload.title,
          userId: payload.userId,
          config: {
            create: {
              processingType: payload.processingType,
              fromDuration,
              toDuration,
              duration: payload.duration,
              prompt: payload.prompt,
              aspectRatio: payload.aspectRatio,
              subtitlesEnabled: Boolean(payload.subtitleStyleKey),
              subtitleStyleKey: payload.subtitleStyleKey,
            },
          },
          metadata: {
            create: {
              source: payload.source,
              sourceUrl: payload.sourceUrl,
              sourceKey: payload.sourceKey,
              thumbnailKey: payload.thumbnailKey,
            },
          },
        },
        include: { config: true, metadata: true },
      });

      const charged = await tx.userBilling.updateMany({
        where: {
          id: billing.id,
          creditsBalance: { gte: estimatedCredits },
        },
        data: {
          creditsBalance: {
            decrement: estimatedCredits,
          },
        },
      });
      if (charged.count !== 1) {
        throw status(
          400,
          "Insufficient credits" satisfies ProcessModel["insufficientCredits"]
        );
      }

      await tx.creditTransaction.create({
        data: {
          userId: payload.userId,
          billingId: billing.id,
          amount: -estimatedCredits,
          type: CreditTransactionType.USAGE,
          description: "Clip processing usage",
          jobId: project.id,
          billingEventId: `project:${project.id}:usage`,
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

      return { project: requireProjectRelations(project) };
    });

    try {
      await processQueue.add(
        "process",
        { projectId: res.project.id },
        { ...PROCESS_JOB_OPTIONS, jobId: res.project.id }
      );
    } catch (error) {
      await this.failProjectAndRefund(
        res.project.id,
        "Unable to queue the processing job"
      );
      throw error;
    }

    return { project: res.project } satisfies ProcessModel["response"];
  }

  static async get(id: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
      include: projectInclude,
    });

    if (!project) {
      throw status(404, "Project not found" satisfies ProjectModel["notFound"]);
    }

    return {
      project: addMediaUrls(requireProjectRelations(project)),
    } satisfies ProjectModel["response"];
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
            ? { in: ["COMPLETED", "FAILED"] }
            : { in: [...PROCESSING_STATUSES] },
      },
      include: projectInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      projects: projects.map((project) =>
        addMediaUrls(requireProjectRelations(project))
      ),
    } satisfies ProjectModel["listResponse"];
  }

  static async updateProject(id: string, data: ProjectModel["updateBody"]) {
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { id: true, progress: true },
    });

    if (!existing) {
      throw status(404, "Project not found" satisfies ProjectModel["notFound"]);
    }

    const { transcriptKey, audioKey, proxyKey, thumbnailKey, ...projectData } =
      data;
    const metadataData = { transcriptKey, audioKey, proxyKey, thumbnailKey };
    const hasMetadataChanges = Object.values(metadataData).some(
      (value) => value !== undefined
    );
    const progress = data.progress;
    const effectiveProjectData = { ...projectData };
    if (progress !== undefined) {
      effectiveProjectData.progress = Math.max(existing.progress, progress);
      if (progress < existing.progress) {
        delete effectiveProjectData.status;
      }
    }
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...effectiveProjectData,
        ...(hasMetadataChanges ? { metadata: { update: metadataData } } : {}),
      },
      include: projectInclude,
    });

    return {
      project: requireProjectRelations(project),
    } satisfies ProjectModel["response"];
  }

  static async completeProject(id: string, body: ProjectModel["completeBody"]) {
    const project = await prisma.$transaction(async (tx) => {
      const updated = await tx.project.updateMany({
        where: { id, status: { notIn: ["COMPLETED", "FAILED"] } },
        data: { status: "COMPLETED", progress: 100, error: null },
      });

      if (updated.count === 1 && body.clips.length > 0) {
        await tx.clip.createMany({
          data: body.clips.map((clip) => ({
            projectId: id,
            ...normalizeClip(clip),
          })),
        });
      }

      const current = await tx.project.findUnique({
        where: { id },
        include: projectInclude,
      });
      if (!current) throw status(404, "Project not found");
      if (
        updated.count === 0 &&
        (current.status !== "COMPLETED" ||
          !sameClips(current.clips, body.clips))
      ) {
        throw status(409, "Project completion conflicts with existing state");
      }
      return requireProjectRelations(current);
    });

    return { project } satisfies ProjectModel["completeResponse"];
  }

  static async getProcessorPayload(
    id: string
  ): Promise<ProcessorJobModel["payload"]> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { config: true, metadata: true },
    });
    if (!project) throw new Error(`Project ${id} was not found`);

    const hydrated = requireProjectRelations(project);
    return ProcessorJobModel.payload.parse({
      projectId: hydrated.id,
      userId: hydrated.userId,
      source: hydrated.metadata.source,
      sourceUrl: hydrated.metadata.sourceUrl,
      sourceKey: hydrated.metadata.sourceKey,
      processingType: hydrated.config.processingType,
      fromDuration: hydrated.config.fromDuration,
      toDuration: hydrated.config.toDuration,
      prompt: hydrated.config.prompt,
      aspectRatio: hydrated.config.aspectRatio,
      subtitlesEnabled: hydrated.config.subtitlesEnabled,
      subtitleStyleKey: hydrated.config.subtitleStyleKey,
    });
  }

  static async failProjectAndRefund(id: string, failure: string) {
    const refundEventId = `project:${id}:refund`;
    try {
      return await prisma.$transaction(async (tx) => {
        const project = await tx.project.findUnique({
          where: { id },
          include: { user: { include: { billing: true } } },
        });
        if (!project || project.status === "COMPLETED") return project;

        const failed = await tx.project.updateMany({
          where: { id, status: { notIn: ["COMPLETED", "FAILED"] } },
          data: {
            status: "FAILED",
            error: failure.slice(0, 2_000),
          },
        });
        if (failed.count === 0 && project.status !== "FAILED") return project;

        const existingRefund = await tx.creditTransaction.findUnique({
          where: { billingEventId: refundEventId },
        });
        if (existingRefund) return project;

        const usage = await tx.creditUsage.findFirst({
          where: { jobId: id },
        });
        const billing = project.user.billing;
        if (!usage || !billing) return project;

        await tx.creditTransaction.create({
          data: {
            userId: project.userId,
            billingId: billing.id,
            amount: usage.amount,
            type: CreditTransactionType.REFUND,
            description: "Refund for failed clip processing",
            jobId: id,
            billingEventId: refundEventId,
          },
        });
        await tx.userBilling.update({
          where: { id: billing.id },
          data: { creditsBalance: { increment: usage.amount } },
        });
        return project;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return prisma.project.findUnique({ where: { id } });
      }
      throw error;
    }
  }
}
