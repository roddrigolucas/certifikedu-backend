-- DropForeignKey
ALTER TABLE "AbilityOnCertificate" DROP CONSTRAINT "AbilityOnCertificate_certificateId_userId_fkey";

-- DropIndex
DROP INDEX "certificates_certificateId_receptorId_key";

-- AddForeignKey
ALTER TABLE "AbilityOnCertificate" ADD CONSTRAINT "AbilityOnCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityOnCertificate" ADD CONSTRAINT "AbilityOnCertificate_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE RESTRICT ON UPDATE CASCADE;
