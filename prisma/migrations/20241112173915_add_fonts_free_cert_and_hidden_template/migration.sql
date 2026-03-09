/*
  Warnings:

  - You are about to drop the column `fontFamily` on the `Templates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Templates" DROP COLUMN "fontFamily",
ADD COLUMN     "fontVariantsIdDescription" TEXT,
ADD COLUMN     "fontVariantsIdName" TEXT,
ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "fontVariantsIdDescription" TEXT,
ADD COLUMN     "fontVariantsIdName" TEXT,
ADD COLUMN     "receptorEmail" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "freeCertificates" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Fonts" (
    "fontId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "family" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" TEXT,

    CONSTRAINT "Fonts_pkey" PRIMARY KEY ("fontId")
);

-- CreateTable
CREATE TABLE "FontsVariants" (
    "fontVariantsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "style" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "eotUrl" TEXT,
    "svgUrl" TEXT,
    "ttfUrl" TEXT NOT NULL,
    "woffUrl" TEXT,
    "woff2Url" TEXT NOT NULL,
    "fontId" TEXT NOT NULL,

    CONSTRAINT "FontsVariants_pkey" PRIMARY KEY ("fontVariantsId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fonts_family_category_key" ON "Fonts"("family", "category");

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_fontVariantsIdDescription_fkey" FOREIGN KEY ("fontVariantsIdDescription") REFERENCES "FontsVariants"("fontVariantsId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_fontVariantsIdName_fkey" FOREIGN KEY ("fontVariantsIdName") REFERENCES "FontsVariants"("fontVariantsId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_fontVariantsIdDescription_fkey" FOREIGN KEY ("fontVariantsIdDescription") REFERENCES "FontsVariants"("fontVariantsId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_fontVariantsIdName_fkey" FOREIGN KEY ("fontVariantsIdName") REFERENCES "FontsVariants"("fontVariantsId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FontsVariants" ADD CONSTRAINT "FontsVariants_fontId_fkey" FOREIGN KEY ("fontId") REFERENCES "Fonts"("fontId") ON DELETE CASCADE ON UPDATE CASCADE;
