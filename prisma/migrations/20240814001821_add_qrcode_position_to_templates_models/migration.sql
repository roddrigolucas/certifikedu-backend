-- CreateEnum
CREATE TYPE "QRCodePositionEnum" AS ENUM ('NULL', 'BOTTOM_RIGHT', 'BOTTOM_LEFT', 'TOP_RIGHT', 'TOP_LEFT');

-- AlterTable
ALTER TABLE "Templates" ADD COLUMN     "qrCodePosition" "QRCodePositionEnum" NOT NULL DEFAULT 'NULL';
