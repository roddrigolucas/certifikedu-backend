-- AlterTable
ALTER TABLE "Templates" ADD COLUMN     "issuesNumberLimit" INTEGER,
ADD COLUMN     "qrCodeExpirationDateTime" TIMESTAMP(3),
ADD COLUMN     "qrCodeStartDateTime" TIMESTAMP(3);
