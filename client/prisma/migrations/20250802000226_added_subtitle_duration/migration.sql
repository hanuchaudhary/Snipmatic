-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "subtitle" BOOLEAN NOT NULL DEFAULT false;
