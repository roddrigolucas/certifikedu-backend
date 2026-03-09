/*
  Warnings:

  - You are about to drop the column `qrCodeExpirationDateTime` on the `Templates` table. All the data in the column will be lost.
  - You are about to drop the column `qrCodeStartDateTime` on the `Templates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Templates" DROP COLUMN "qrCodeExpirationDateTime",
DROP COLUMN "qrCodeStartDateTime",
ADD COLUMN     "expirationDateTime" TIMESTAMP(3),
ADD COLUMN     "startDateTime" TIMESTAMP(3);
