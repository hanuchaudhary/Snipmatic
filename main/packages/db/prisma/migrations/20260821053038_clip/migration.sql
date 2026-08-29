/*
  Warnings:

  - You are about to drop the column `duration` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `finalKeys` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `from` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `layoutKey` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `subtitlesKey` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `Job` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ClipStatus" AS ENUM ('QUEUED', 'GENERATING_SUBTITLES', 'RENDERING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "LayoutType" AS ENUM ('SINGLE', 'SPLIT_VERTICAL');

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "duration",
DROP COLUMN "finalKeys",
DROP COLUMN "from",
DROP COLUMN "layoutKey",
DROP COLUMN "subtitlesKey",
DROP COLUMN "to",
ADD COLUMN     "bgMusicIntensity" DOUBLE PRECISION DEFAULT 0.3,
ADD COLUMN     "searchFrom" DOUBLE PRECISION,
ADD COLUMN     "searchTo" DOUBLE PRECISION,
ADD COLUMN     "subtitleStyleKey" TEXT;

-- CreateTable
CREATE TABLE "Clip" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "ClipStatus" NOT NULL DEFAULT 'QUEUED',
    "from" DOUBLE PRECISION NOT NULL,
    "to" DOUBLE PRECISION NOT NULL,
    "aspectRatio" TEXT,
    "subtitleStyleKey" TEXT,
    "bgMusicKey" TEXT,
    "bgMusicIntensity" DOUBLE PRECISION,
    "subtitlesKey" TEXT,
    "layoutType" "LayoutType" NOT NULL DEFAULT 'SINGLE',
    "secondaryVideoKey" TEXT,
    "outputKey" TEXT,
    "thumbnail" TEXT,
    "duration" DOUBLE PRECISION,
    "score" DOUBLE PRECISION,
    "title" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Clip_jobId_idx" ON "Clip"("jobId");

-- CreateIndex
CREATE INDEX "Clip_status_idx" ON "Clip"("status");

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
