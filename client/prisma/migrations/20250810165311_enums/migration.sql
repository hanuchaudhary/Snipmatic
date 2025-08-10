/*
  Warnings:

  - The values [PENDING] on the enum `JobStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."JobStatus_new" AS ENUM ('QUEUED', 'DOWNLOADING', 'DOWNLOADED', 'EXTRACTING_AUDIO', 'TRANSCRIBING', 'ANALYZING', 'CREATING_CLIPS', 'COMPLETED', 'FAILED');
ALTER TABLE "public"."Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Task" ALTER COLUMN "status" TYPE "public"."JobStatus_new" USING ("status"::text::"public"."JobStatus_new");
ALTER TYPE "public"."JobStatus" RENAME TO "JobStatus_old";
ALTER TYPE "public"."JobStatus_new" RENAME TO "JobStatus";
DROP TYPE "public"."JobStatus_old";
ALTER TABLE "public"."Task" ALTER COLUMN "status" SET DEFAULT 'QUEUED';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Task" ALTER COLUMN "status" SET DEFAULT 'QUEUED';
