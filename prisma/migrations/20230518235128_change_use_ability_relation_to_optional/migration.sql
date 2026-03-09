-- DropForeignKey
ALTER TABLE "AbilityOnCertificate" DROP CONSTRAINT "AbilityOnCertificate_userId_fkey";

-- AlterTable
ALTER TABLE "AbilityOnCertificate" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AbilityOnCertificate" ADD CONSTRAINT "AbilityOnCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
