-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "playable" BOOLEAN NOT NULL DEFAULT false;

-- Backfill : les jeux en ligne ou en bêta étaient jouables
UPDATE "Project" SET "playable" = true WHERE "kind" = 'GAME' AND "status" IN ('LIVE', 'BETA');
