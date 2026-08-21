/*
  Warnings:

  - You are about to drop the column `audio` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `captions` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `inngestRunId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `layout` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `modalCallId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `output` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `stage` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `videoId` on the `Job` table. All the data in the column will be lost.
  - The `status` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `creditUsage` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceKey` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('QUEUED', 'DOWNLOADING', 'PREPROCESSING', 'TRANSCRIBING', 'DIARIZING', 'DETECTING_FACES', 'TRACKING', 'ANALYZING', 'FINDING_CLIPS', 'GENERATING_SUBTITLES', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ClipType" AS ENUM ('AI', 'MANUAL');

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_userId_fkey";

-- DropIndex
DROP INDEX "Job_status_stage_idx";

-- DropIndex
DROP INDEX "Job_videoId_idx";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "audio",
DROP COLUMN "captions",
DROP COLUMN "completedAt",
DROP COLUMN "inngestRunId",
DROP COLUMN "layout",
DROP COLUMN "modalCallId",
DROP COLUMN "output",
DROP COLUMN "stage",
DROP COLUMN "startedAt",
DROP COLUMN "videoId",
ADD COLUMN     "aspectRatio" TEXT,
ADD COLUMN     "bgMusicKey" TEXT,
ADD COLUMN     "clipType" "ClipType" NOT NULL DEFAULT 'AI',
ADD COLUMN     "creditUsage" INTEGER NOT NULL,
ADD COLUMN     "duration" DOUBLE PRECISION,
ADD COLUMN     "finalKeys" TEXT[],
ADD COLUMN     "layoutKey" TEXT,
ADD COLUMN     "source" "VideoSource" NOT NULL,
ADD COLUMN     "sourceKey" TEXT NOT NULL,
ADD COLUMN     "subtitlesKey" TEXT,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "title" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'QUEUED',
ALTER COLUMN "progress" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "UserBilling" ALTER COLUMN "creditsBalance" SET DEFAULT 30;

-- DropTable
DROP TABLE "Video";

-- DropEnum
DROP TYPE "ProcessingStage";

-- DropEnum
DROP TYPE "ProcessingStatus";

-- CreateTable
CREATE TABLE "CreditUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "jobId" TEXT,

    CONSTRAINT "CreditUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");
