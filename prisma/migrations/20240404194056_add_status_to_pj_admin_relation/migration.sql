-- CreateEnum
CREATE TYPE "PJAssociationStatus" AS ENUM ('REVIEW', 'ENABLED');

-- AlterTable
ALTER TABLE "PJAdmins" ADD COLUMN     "status" "PJAssociationStatus" NOT NULL DEFAULT 'REVIEW';
