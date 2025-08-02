-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "clipType" TEXT,
ADD COLUMN     "multipleClips" BOOLEAN NOT NULL DEFAULT false;
