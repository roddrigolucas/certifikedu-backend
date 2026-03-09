/*
  Warnings:

  - You are about to drop the column `reverseId` on the `Templates` table. All the data in the column will be lost.
  - You are about to drop the `ReverseCertificateImages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReverseCertificateImages" DROP CONSTRAINT "ReverseCertificateImages_idPJ_fkey";

-- DropForeignKey
ALTER TABLE "Templates" DROP CONSTRAINT "Templates_reverseId_fkey";

-- AlterTable
ALTER TABLE "Templates" DROP COLUMN "reverseId",
ADD COLUMN     "inverseId" TEXT;

-- DropTable
DROP TABLE "ReverseCertificateImages";

-- CreateTable
CREATE TABLE "InverseCertificateImages" (
    "inverseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bucket" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageType" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "idPJ" TEXT,

    CONSTRAINT "InverseCertificateImages_pkey" PRIMARY KEY ("inverseId")
);

-- CreateIndex
CREATE UNIQUE INDEX "InverseCertificateImages_inverseId_imageUrl_key" ON "InverseCertificateImages"("inverseId", "imageUrl");

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_inverseId_fkey" FOREIGN KEY ("inverseId") REFERENCES "InverseCertificateImages"("inverseId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InverseCertificateImages" ADD CONSTRAINT "InverseCertificateImages_idPJ_fkey" FOREIGN KEY ("idPJ") REFERENCES "PessoaJuridica"("idPJ") ON DELETE CASCADE ON UPDATE CASCADE;
