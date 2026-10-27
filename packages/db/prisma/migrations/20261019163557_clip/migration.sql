-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'CLIP', 'STUDIO');

-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('SUBSCRIPTION_GRANT', 'USAGE', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "VideoSource" AS ENUM ('YOUTUBE', 'UPLOAD');

-- CreateEnum
CREATE TYPE "ProcessingType" AS ENUM ('AI', 'MANUAL');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('QUEUED', 'DOWNLOADING', 'PREPROCESSING', 'TRANSCRIBING', 'DIARIZING', 'DETECTING_FACES', 'TRACKING', 'ANALYZING', 'FINDING_CLIPS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'oauth',
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "sessionState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBilling" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dodoCustomerId" TEXT,
    "dodoSubscriptionId" TEXT,
    "planTier" "PlanTier" NOT NULL DEFAULT 'FREE',
    "creditsBalance" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBilling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "CreditUsage_pkey" PRIMARY KEY ("id")
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
    "billingEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectConfig" (
    "projectId" TEXT NOT NULL,
    "processingType" "ProcessingType" NOT NULL,
    "fromDuration" DOUBLE PRECISION NOT NULL,
    "toDuration" DOUBLE PRECISION NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "prompt" TEXT,
    "aspectRatio" TEXT NOT NULL,
    "subtitlesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "subtitleStyleKey" TEXT,

    CONSTRAINT "ProjectConfig_pkey" PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "ProjectMetadata" (
    "projectId" TEXT NOT NULL,
    "source" "VideoSource" NOT NULL,
    "sourceUrl" TEXT,
    "sourceKey" TEXT,
    "thumbnailKey" TEXT,
    "transcriptKey" TEXT,
    "audioKey" TEXT,
    "proxyKey" TEXT,

    CONSTRAINT "ProjectMetadata_pkey" PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "Clip" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "from" DOUBLE PRECISION NOT NULL,
    "to" DOUBLE PRECISION NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "score" DOUBLE PRECISION,
    "title" TEXT,
    "subtitlesKey" TEXT,
    "outputKey" TEXT NOT NULL,
    "thumbnailKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_value_key" ON "Verification"("value");

-- CreateIndex
CREATE UNIQUE INDEX "UserBilling_userId_key" ON "UserBilling"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBilling_dodoCustomerId_key" ON "UserBilling"("dodoCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBilling_dodoSubscriptionId_key" ON "UserBilling"("dodoSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditTransaction_billingEventId_key" ON "CreditTransaction"("billingEventId");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_createdAt_idx" ON "CreditTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Project_userId_createdAt_idx" ON "Project"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "ProjectMetadata_source_idx" ON "ProjectMetadata"("source");

-- CreateIndex
CREATE INDEX "Clip_projectId_createdAt_idx" ON "Clip"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Clip_projectId_outputKey_key" ON "Clip"("projectId", "outputKey");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBilling" ADD CONSTRAINT "UserBilling_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "UserBilling"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectConfig" ADD CONSTRAINT "ProjectConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMetadata" ADD CONSTRAINT "ProjectMetadata_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
