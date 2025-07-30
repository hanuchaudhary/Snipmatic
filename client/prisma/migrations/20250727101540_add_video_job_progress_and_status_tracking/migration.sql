/*
  Warnings:

  - You are about to drop the column `description` on the `VideoJob` table. All the data in the column will be lost.
  - You are about to drop the column `jobId` on the `VideoJob` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `VideoJob` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JobStatus" ADD VALUE 'QUEUED';
ALTER TYPE "JobStatus" ADD VALUE 'DOWNLOADING';
ALTER TYPE "JobStatus" ADD VALUE 'TRANSCRIBING';
ALTER TYPE "JobStatus" ADD VALUE 'CREATING_CLIPS';

-- AlterTable
ALTER TABLE "VideoJob" DROP COLUMN "description",
DROP COLUMN "jobId",
DROP COLUMN "thumbnailUrl",
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "s3Key" TEXT,
ADD COLUMN     "s3Urls" JSONB,
ADD COLUMN     "statusMessage" TEXT,
ADD COLUMN     "taskId" TEXT;

-- CreateIndex
CREATE INDEX "VideoJob_taskId_idx" ON "VideoJob"("taskId");
