-- AlterTable
ALTER TABLE "Job" DROP COLUMN IF EXISTS "bgMusicKey",
DROP COLUMN IF EXISTS "bgMusicIntensity";

-- AlterTable
ALTER TABLE "Clip" DROP COLUMN IF EXISTS "bgMusicKey",
DROP COLUMN IF EXISTS "bgMusicIntensity",
DROP COLUMN IF EXISTS "layoutType",
DROP COLUMN IF EXISTS "secondaryVideoKey";

-- DropEnum
DROP TYPE IF EXISTS "LayoutType";
