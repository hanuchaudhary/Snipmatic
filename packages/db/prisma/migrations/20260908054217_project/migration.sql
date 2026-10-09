/*
  Warnings:

  - You are about to drop the column `jobId` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `processingType` to the `Clip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Clip` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProcessingType" AS ENUM ('AI', 'MANUAL');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('QUEUED', 'DOWNLOADING', 'PREPROCESSING', 'TRANSCRIBING', 'DIARIZING', 'DETECTING_FACES', 'TRACKING', 'ANALYZING', 'FINDING_CLIPS', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "Clip" DROP CONSTRAINT "Clip_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_userId_fkey";

-- DropIndex
DROP INDEX "Clip_jobId_idx";

-- AlterTable
ALTER TABLE "Clip" DROP COLUMN "jobId",
DROP COLUMN "thumbnail",
ADD COLUMN     "processingType" "ProcessingType" NOT NULL,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "projectId" TEXT NOT NULL,
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "subtitlesEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "thumbnailKey" TEXT;

-- DropTable
DROP TABLE "Job";

-- DropEnum
DROP TYPE "ClipType";

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "source" "VideoSource" NOT NULL,
    "sourceUrl" TEXT,
    "sourceKey" TEXT,
    "duration" DOUBLE PRECISION,
    "thumbnailKey" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "prompt" TEXT,
    "fromDuration" DOUBLE PRECISION,
    "toDuration" DOUBLE PRECISION,
    "transcriptKey" TEXT,
    "audioKey" TEXT,
    "proxyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_userId_createdAt_idx" ON "Project"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Clip_projectId_createdAt_idx" ON "Clip"("projectId", "createdAt");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
