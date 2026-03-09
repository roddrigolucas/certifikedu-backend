/*
  Warnings:

  - You are about to drop the column `openBadgeUrl` on the `certificates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "openBadgeUrl",
ADD COLUMN     "openBadgeId" TEXT;

-- CreateTable
CREATE TABLE "OpenBadges" (
    "openBadgeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assertionUrl" TEXT NOT NULL,
    "badgeUrl" TEXT NOT NULL,
    "issuerUrl" TEXT NOT NULL,
    "classUrl" TEXT NOT NULL,

    CONSTRAINT "OpenBadges_pkey" PRIMARY KEY ("openBadgeId")
);

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_openBadgeId_fkey" FOREIGN KEY ("openBadgeId") REFERENCES "OpenBadges"("openBadgeId") ON DELETE SET NULL ON UPDATE CASCADE;
