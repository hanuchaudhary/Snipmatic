/*
  Warnings:

  - Made the column `jobId` on table `CreditUsage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CreditUsage" ALTER COLUMN "jobId" SET NOT NULL;
