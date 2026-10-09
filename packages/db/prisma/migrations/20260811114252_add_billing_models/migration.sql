-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('STARTER', 'INFLUENCER', 'STUDIO');

-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('SUBSCRIPTION_GRANT', 'USAGE', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProcessingStage" AS ENUM ('QUEUED', 'DOWNLOADING', 'PREPROCESSING', 'TRANSCRIBING', 'DIARIZING', 'DETECTING_FACES', 'TRACKING', 'ANALYZING', 'FINDING_CLIPS', 'GENERATING_SUBTITLES', 'COMPLETED');

-- CreateEnum
CREATE TYPE "VideoSource" AS ENUM ('YOUTUBE', 'UPLOAD');

-- CreateTable
CREATE TABLE "UserBilling" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "planTier" "PlanTier" NOT NULL DEFAULT 'STARTER',
    "creditsBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBilling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "billingId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "jobId" TEXT,
    "stripeInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'QUEUED',
    "stage" "ProcessingStage" NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER,
    "from" DOUBLE PRECISION,
    "to" DOUBLE PRECISION,
    "prompt" TEXT,
    "captions" JSONB,
    "layout" JSONB,
    "audio" JSONB,
    "output" JSONB,
    "inngestRunId" TEXT,
    "modalCallId" TEXT,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "VideoSource" NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceId" TEXT,
    "title" TEXT,
    "thumbnail" TEXT,
    "duration" DOUBLE PRECISION,
    "channelName" TEXT,
    "channelId" TEXT,
    "originalKey" TEXT,
    "finalKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBilling_userId_key" ON "UserBilling"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBilling_stripeCustomerId_key" ON "UserBilling"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBilling_stripeSubscriptionId_key" ON "UserBilling"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditTransaction_stripeInvoiceId_key" ON "CreditTransaction"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_createdAt_idx" ON "CreditTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Job_userId_createdAt_idx" ON "Job"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Job_videoId_idx" ON "Job"("videoId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_status_stage_idx" ON "Job"("status", "stage");

-- CreateIndex
CREATE INDEX "Video_userId_createdAt_idx" ON "Video"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Video_source_sourceId_idx" ON "Video"("source", "sourceId");

-- AddForeignKey
ALTER TABLE "UserBilling" ADD CONSTRAINT "UserBilling_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "UserBilling"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
