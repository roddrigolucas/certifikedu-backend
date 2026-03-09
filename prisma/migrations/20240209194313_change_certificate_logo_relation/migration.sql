/*
  Warnings:

  - You are about to drop the column `certificateId` on the `BadgeLogos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BadgeLogos" DROP CONSTRAINT "BadgeLogos_certificateId_fkey";

-- DropIndex
DROP INDEX "BadgeLogos_certificateId_key";

-- AlterTable
ALTER TABLE "BadgeLogos" DROP COLUMN "certificateId";

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "badgeLogoId" TEXT;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_badgeLogoId_fkey" FOREIGN KEY ("badgeLogoId") REFERENCES "BadgeLogos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
