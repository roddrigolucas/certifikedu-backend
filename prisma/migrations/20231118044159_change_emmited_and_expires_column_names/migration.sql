/*
  Warnings:

  - You are about to drop the column `emittedAt` on the `certificates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "emittedAt",
ADD COLUMN     "issuedAt" TIMESTAMP(3);
