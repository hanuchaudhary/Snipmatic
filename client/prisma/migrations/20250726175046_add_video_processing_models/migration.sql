-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'DOWNLOADING', 'PROCESSING', 'TRANSCRIBING', 'CLIPPING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "VideoProcessingJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "jobId" TEXT,
    "maxClips" INTEGER NOT NULL DEFAULT 5,
    "clipDuration" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "VideoProcessingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoClip" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" DOUBLE PRECISION NOT NULL,
    "endTime" DOUBLE PRECISION NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "transcription" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoClip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoProcessingJob_userId_idx" ON "VideoProcessingJob"("userId");

-- CreateIndex
CREATE INDEX "VideoProcessingJob_status_idx" ON "VideoProcessingJob"("status");

-- CreateIndex
CREATE INDEX "VideoProcessingJob_createdAt_idx" ON "VideoProcessingJob"("createdAt");

-- CreateIndex
CREATE INDEX "VideoClip_jobId_idx" ON "VideoClip"("jobId");

-- CreateIndex
CREATE INDEX "VideoClip_createdAt_idx" ON "VideoClip"("createdAt");

-- AddForeignKey
ALTER TABLE "VideoProcessingJob" ADD CONSTRAINT "VideoProcessingJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoClip" ADD CONSTRAINT "VideoClip_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "VideoProcessingJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
