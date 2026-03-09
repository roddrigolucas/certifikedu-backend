-- AlterTable
ALTER TABLE "Templates" ADD COLUMN     "reverseId" TEXT;

-- CreateTable
CREATE TABLE "ReverseCertificateImages" (
    "reverseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bucket" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageType" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "idPJ" TEXT,

    CONSTRAINT "ReverseCertificateImages_pkey" PRIMARY KEY ("reverseId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReverseCertificateImages_reverseId_imageUrl_key" ON "ReverseCertificateImages"("reverseId", "imageUrl");

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_reverseId_fkey" FOREIGN KEY ("reverseId") REFERENCES "ReverseCertificateImages"("reverseId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReverseCertificateImages" ADD CONSTRAINT "ReverseCertificateImages_idPJ_fkey" FOREIGN KEY ("idPJ") REFERENCES "PessoaJuridica"("idPJ") ON DELETE CASCADE ON UPDATE CASCADE;
