/*
  Warnings:

  - The values [PORTATIA] on the enum `CredentialTypeEnum` will be removed. If these variants are still used in the database, this will fail.
  - The values [EmtemplateIdpresarial] on the enum `EducationLevelEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "PJAdminRoleEnum" AS ENUM ('basico', 'medio', 'admin');

-- AlterEnum
BEGIN;
CREATE TYPE "CredentialTypeEnum_new" AS ENUM ('PARECER', 'RESOLUCAO', 'DECRETO', 'PORTARIA', 'LEIFEDERAL', 'LEIESTADUAL', 'LEIMUNICIPAL', 'ATOPROPRIO', 'DELIBERACAO');
ALTER TABLE "AcademicCredentials" ALTER COLUMN "credentialType" TYPE "CredentialTypeEnum_new" USING ("credentialType"::text::"CredentialTypeEnum_new");
ALTER TYPE "CredentialTypeEnum" RENAME TO "CredentialTypeEnum_old";
ALTER TYPE "CredentialTypeEnum_new" RENAME TO "CredentialTypeEnum";
DROP TYPE "CredentialTypeEnum_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "EducationLevelEnum_new" AS ENUM ('EducacaoInfantil', 'EnsinoFundamental', 'EnsinoMedio', 'Graduacao', 'GraduacaoTecnologica', 'PosGraduacao', 'Mestrado', 'Doutorado', 'PosDoutorado', 'Extensao', 'Profissionalizante', 'EducacaoEmpresarial');
ALTER TABLE "Course" ALTER COLUMN "educationLevel" TYPE "EducationLevelEnum_new" USING ("educationLevel"::text::"EducationLevelEnum_new");
ALTER TYPE "EducationLevelEnum" RENAME TO "EducationLevelEnum_old";
ALTER TYPE "EducationLevelEnum_new" RENAME TO "EducationLevelEnum";
DROP TYPE "EducationLevelEnum_old";
COMMIT;

-- CreateTable
CREATE TABLE "PJAdmins" (
    "idAdmin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "PJAdminRoleEnum" NOT NULL,
    "idPF" TEXT NOT NULL,
    "idPJ" TEXT NOT NULL,

    CONSTRAINT "PJAdmins_pkey" PRIMARY KEY ("idAdmin")
);

-- AddForeignKey
ALTER TABLE "PJAdmins" ADD CONSTRAINT "PJAdmins_idPF_fkey" FOREIGN KEY ("idPF") REFERENCES "PessoaFisica"("idPF") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PJAdmins" ADD CONSTRAINT "PJAdmins_idPJ_fkey" FOREIGN KEY ("idPJ") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;
