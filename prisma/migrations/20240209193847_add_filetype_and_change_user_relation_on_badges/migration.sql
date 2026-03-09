/*
  Warnings:

  - Added the required column `fileType` to the `BadgeLogos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BadgeLogos" DROP CONSTRAINT "BadgeLogos_userId_fkey";

-- AlterTable
ALTER TABLE "BadgeLogos" ADD COLUMN     "fileType" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BadgeLogos" ADD CONSTRAINT "BadgeLogos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
