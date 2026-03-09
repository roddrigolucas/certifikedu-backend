/*
  Warnings:

  - You are about to drop the column `habilidades` on the `certificates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocumentsPictures" ADD COLUMN     "fotoType" TEXT;

-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "habilidades";

-- CreateTable
CREATE TABLE "Abilities" (
    "habilidadeId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "habilidade" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "AbilityOnCertificate" (
    "id" SERIAL NOT NULL,
    "certificateId" INTEGER NOT NULL,
    "habilidadeId" INTEGER NOT NULL,

    CONSTRAINT "AbilityOnCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Abilities_habilidadeId_key" ON "Abilities"("habilidadeId");

-- CreateIndex
CREATE UNIQUE INDEX "AbilityOnCertificate_certificateId_habilidadeId_key" ON "AbilityOnCertificate"("certificateId", "habilidadeId");

-- AddForeignKey
ALTER TABLE "AbilityOnCertificate" ADD CONSTRAINT "AbilityOnCertificate_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityOnCertificate" ADD CONSTRAINT "AbilityOnCertificate_habilidadeId_fkey" FOREIGN KEY ("habilidadeId") REFERENCES "Abilities"("habilidadeId") ON DELETE RESTRICT ON UPDATE CASCADE;
