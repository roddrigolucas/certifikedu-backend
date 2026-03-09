/*
  Warnings:

  - You are about to drop the column `fontVariantsIdDescription` on the `Events` table. All the data in the column will be lost.
  - You are about to drop the column `fontVariantsIdName` on the `Events` table. All the data in the column will be lost.
  - You are about to drop the column `fontVariantsIdDescription` on the `Templates` table. All the data in the column will be lost.
  - You are about to drop the column `fontVariantsIdName` on the `Templates` table. All the data in the column will be lost.
  - You are about to drop the column `fontVariantsIdDescription` on the `certificates` table. All the data in the column will be lost.
  - You are about to drop the column `fontVariantsIdName` on the `certificates` table. All the data in the column will be lost.
  - You are about to drop the `FontsVariants` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ttfUrl` to the `Fonts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Events" DROP CONSTRAINT "Events_fontVariantsIdDescription_fkey";

-- DropForeignKey
ALTER TABLE "Events" DROP CONSTRAINT "Events_fontVariantsIdName_fkey";

-- DropForeignKey
ALTER TABLE "FontsVariants" DROP CONSTRAINT "FontsVariants_fontId_fkey";

-- DropForeignKey
ALTER TABLE "Templates" DROP CONSTRAINT "Templates_fontVariantsIdDescription_fkey";

-- DropForeignKey
ALTER TABLE "Templates" DROP CONSTRAINT "Templates_fontVariantsIdName_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_fontVariantsIdDescription_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_fontVariantsIdName_fkey";

-- AlterTable
ALTER TABLE "Events" DROP COLUMN "fontVariantsIdDescription",
DROP COLUMN "fontVariantsIdName",
ADD COLUMN     "fontDescId" TEXT,
ADD COLUMN     "fontNameId" TEXT;

-- AlterTable
ALTER TABLE "Fonts" ADD COLUMN     "descDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nameDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "style" TEXT,
ADD COLUMN     "ttfUrl" TEXT NOT NULL,
ADD COLUMN     "weight" TEXT,
ADD COLUMN     "woffUrl" TEXT;

-- AlterTable
ALTER TABLE "Templates" DROP COLUMN "fontVariantsIdDescription",
DROP COLUMN "fontVariantsIdName",
ADD COLUMN     "fontDescId" TEXT,
ADD COLUMN     "fontNameId" TEXT;

-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "fontVariantsIdDescription",
DROP COLUMN "fontVariantsIdName",
ADD COLUMN     "fontDescId" TEXT,
ADD COLUMN     "fontNameId" TEXT;

-- DropTable
DROP TABLE "FontsVariants";

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_fontDescId_fkey" FOREIGN KEY ("fontDescId") REFERENCES "Fonts"("fontId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_fontNameId_fkey" FOREIGN KEY ("fontNameId") REFERENCES "Fonts"("fontId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_fontDescId_fkey" FOREIGN KEY ("fontDescId") REFERENCES "Fonts"("fontId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_fontNameId_fkey" FOREIGN KEY ("fontNameId") REFERENCES "Fonts"("fontId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_fontDescId_fkey" FOREIGN KEY ("fontDescId") REFERENCES "Fonts"("fontId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_fontNameId_fkey" FOREIGN KEY ("fontNameId") REFERENCES "Fonts"("fontId") ON DELETE SET NULL ON UPDATE CASCADE;
