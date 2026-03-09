-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('REVIEW', 'ENABLED', 'DISABLED');

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "status" "CertificateStatus" NOT NULL DEFAULT 'REVIEW';
