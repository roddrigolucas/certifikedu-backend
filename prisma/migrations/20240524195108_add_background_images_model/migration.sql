-- CreateTable
CREATE TABLE "BackgroundCertificateImages" (
    "backgroundId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageType" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "idPJ" TEXT NOT NULL,

    CONSTRAINT "BackgroundCertificateImages_pkey" PRIMARY KEY ("backgroundId")
);

-- CreateIndex
CREATE UNIQUE INDEX "BackgroundCertificateImages_idPJ_key" ON "BackgroundCertificateImages"("idPJ");

-- AddForeignKey
ALTER TABLE "BackgroundCertificateImages" ADD CONSTRAINT "BackgroundCertificateImages_idPJ_fkey" FOREIGN KEY ("idPJ") REFERENCES "PessoaJuridica"("idPJ") ON DELETE CASCADE ON UPDATE CASCADE;
