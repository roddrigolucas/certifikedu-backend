/*
  Warnings:

  - You are about to drop the column `fotoDocumento` on the `DocumentsPictures` table. All the data in the column will be lost.
  - Added the required column `fotoHash` to the `DocumentsPictures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Url` to the `DocumentsPictures` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DocumentsPictures" DROP COLUMN "fotoDocumento",
ADD COLUMN     "fotoHash" TEXT NOT NULL,
ADD COLUMN     "s3Url" TEXT NOT NULL;
