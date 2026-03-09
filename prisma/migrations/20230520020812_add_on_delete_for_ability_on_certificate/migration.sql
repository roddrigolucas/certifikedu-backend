-- DropForeignKey
ALTER TABLE "AbilityOnCertificate" DROP CONSTRAINT "AbilityOnCertificate_certificateId_fkey";

-- DropForeignKey
ALTER TABLE "AbilityOnCertificate" DROP CONSTRAINT "AbilityOnCertificate_habilidadeId_fkey";

-- AddForeignKey
ALTER TABLE "AbilityOnCertificate" ADD CONSTRAINT "AbilityOnCertificate_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityOnCertificate" ADD CONSTRAINT "AbilityOnCertificate_habilidadeId_fkey" FOREIGN KEY ("habilidadeId") REFERENCES "Abilities"("habilidadeId") ON DELETE CASCADE ON UPDATE CASCADE;
