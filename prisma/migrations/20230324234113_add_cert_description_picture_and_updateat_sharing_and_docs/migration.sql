/*
  Warnings:

  - Added the required column `updatedAt` to the `CertificatesSharing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DocumentsPictures` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CertificatesSharing" ADD COLUMN     "isValid" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DocumentsPictures" ADD COLUMN     "status" "CertificateStatus" NOT NULL DEFAULT 'REVIEW',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "certificatePicture" TEXT,
ADD COLUMN     "description" TEXT;
