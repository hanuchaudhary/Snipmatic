/*
  Warnings:

  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "public"."Subscription";

-- CreateTable
CREATE TABLE "public"."CreditPackage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageType" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "public"."TransactionStatus" NOT NULL,
    "paymentMethod" TEXT,
    "paymentId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CreditUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "creditsUsed" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreditPackage_userId_idx" ON "public"."CreditPackage"("userId");

-- CreateIndex
CREATE INDEX "CreditPackage_status_idx" ON "public"."CreditPackage"("status");

-- CreateIndex
CREATE INDEX "CreditPackage_createdAt_idx" ON "public"."CreditPackage"("createdAt");

-- CreateIndex
CREATE INDEX "CreditUsage_userId_idx" ON "public"."CreditUsage"("userId");

-- CreateIndex
CREATE INDEX "CreditUsage_taskId_idx" ON "public"."CreditUsage"("taskId");

-- CreateIndex
CREATE INDEX "CreditUsage_createdAt_idx" ON "public"."CreditUsage"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."CreditPackage" ADD CONSTRAINT "CreditPackage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CreditUsage" ADD CONSTRAINT "CreditUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CreditUsage" ADD CONSTRAINT "CreditUsage_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;
