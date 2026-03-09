/*
  Warnings:

  - You are about to drop the column `fotoDocumento` on the `PessoaFisica` table. All the data in the column will be lost.
  - You are about to drop the column `fotoDocumento` on the `Socios` table. All the data in the column will be lost.
  - The primary key for the `certificates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `certificates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PessoaFisica" DROP COLUMN "fotoDocumento";

-- AlterTable
ALTER TABLE "Socios" DROP COLUMN "fotoDocumento";

-- AlterTable
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_pkey",
DROP COLUMN "id",
ADD COLUMN     "blockchain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "blockchainUrl" TEXT,
ADD COLUMN     "certificateId" SERIAL NOT NULL,
ADD COLUMN     "openBadge" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "openBadgeUrl" TEXT,
ADD CONSTRAINT "certificates_pkey" PRIMARY KEY ("certificateId");

-- CreateTable
CREATE TABLE "DocumentsPictures" (
    "documentId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "fotoDocumento" TEXT,

    CONSTRAINT "DocumentsPictures_pkey" PRIMARY KEY ("documentId")
);

-- CreateTable
CREATE TABLE "CertificatesSharing" (
    "hashId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateId" INTEGER NOT NULL,
    "certificateHash" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentsPictures_userId_key" ON "DocumentsPictures"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificatesSharing_hashId_key" ON "CertificatesSharing"("hashId");

-- AddForeignKey
ALTER TABLE "DocumentsPictures" ADD CONSTRAINT "DocumentsPictures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificatesSharing" ADD CONSTRAINT "CertificatesSharing_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE RESTRICT ON UPDATE CASCADE;
