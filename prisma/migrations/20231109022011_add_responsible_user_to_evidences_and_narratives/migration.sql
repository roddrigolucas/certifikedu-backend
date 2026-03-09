/*
  Warnings:

  - Added the required column `createdByUser` to the `EvidenceOpenBadge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `NarrativeOpenBadge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EvidenceOpenBadge" ADD COLUMN     "createdByUser" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "NarrativeOpenBadge" ADD COLUMN     "createdByUser" INTEGER NOT NULL;
