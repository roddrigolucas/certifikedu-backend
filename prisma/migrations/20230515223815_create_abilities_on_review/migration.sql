/*
  Warnings:

  - You are about to drop the column `status` on the `Abilities` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[certificateId,receptorId]` on the table `certificates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `AbilityOnCertificate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AbilityOnReviewStatus" AS ENUM ('REVIEW', 'ENABLED', 'DISABLED');

-- DropForeignKey
ALTER TABLE "AbilityOnCertificate" DROP CONSTRAINT "AbilityOnCertificate_certificateId_fkey";

-- AlterTable
ALTER TABLE "Abilities" DROP COLUMN "status",
ADD COLUMN     "isValid" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "AbilityOnCertificate" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "AbilityOnReview" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "habilidade" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "status" "AbilityOnReviewStatus" NOT NULL DEFAULT 'REVIEW'
);

-- CreateIndex
CREATE UNIQUE INDEX "AbilityOnReview_id_key" ON "AbilityOnReview"("id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificateId_receptorId_key" ON "certificates"("certificateId", "receptorId");

-- AddForeignKey
ALTER TABLE "AbilityOnCertificate" ADD CONSTRAINT "AbilityOnCertificate_certificateId_userId_fkey" FOREIGN KEY ("certificateId", "userId") REFERENCES "certificates"("certificateId", "receptorId") ON DELETE RESTRICT ON UPDATE CASCADE;
