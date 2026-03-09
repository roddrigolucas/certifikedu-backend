/*
  Warnings:

  - A unique constraint covering the columns `[emissionId,certificateId]` on the table `certificates` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CertificateSuccessStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "emissionId" TEXT,
ADD COLUMN     "successStatus" "CertificateSuccessStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "certificates_emissionId_certificateId_key" ON "certificates"("emissionId", "certificateId");

UPDATE "certificates" SET "successStatus" = 'SUCCESS';
