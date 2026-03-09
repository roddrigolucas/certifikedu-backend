-- AlterTable
ALTER TABLE "EvidenceOpenBadge" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "descriptionImage" TEXT,
ADD COLUMN     "statedIssuer" TEXT;

-- Manually inserted line to change cargaHoraria from Hours to Minutes
UPDATE "certificates" SET "cargaHoraria" = "cargaHoraria" * 60;

-- Manually inserted line to change cargaHoraria from Hours to Minutes
UPDATE "Templates" SET "cargaHoraria" = "cargaHoraria" * 60;
