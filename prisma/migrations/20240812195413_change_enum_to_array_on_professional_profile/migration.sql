/*
  Warnings:

  - The values [Canvas] on the enum `EducationLevelEnum` will be removed. If these variants are still used in the database, this will fail.
  - Changed the column `seniorityLevel` on the `ProfessionalProfile` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `educationLevel` on the `ProfessionalProfile` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `opportunityType` on the `ProfessionalProfile` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EducationLevelEnum_new" AS ENUM ('EducacaoInfantil', 'EnsinoFundamental', 'EnsinoMedio', 'Graduacao', 'GraduacaoTecnologica', 'PosGraduacao', 'Mestrado', 'Doutorado', 'PosDoutorado', 'Extensao', 'Profissionalizante', 'EducacaoEmpresarial');
ALTER TABLE "Course" ALTER COLUMN "educationLevel" TYPE "EducationLevelEnum_new" USING ("educationLevel"::text::"EducationLevelEnum_new");
ALTER TYPE "EducationLevelEnum" RENAME TO "EducationLevelEnum_old";
ALTER TYPE "EducationLevelEnum_new" RENAME TO "EducationLevelEnum";
DROP TYPE "EducationLevelEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "JobOpportunity" ALTER COLUMN "pcdInfo" SET DEFAULT 'PCD_ACCEPT';

-- AlterTable
ALTER TABLE "ProfessionalProfile" ADD COLUMN     "isPcd" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "seniorityLevel" SET DATA TYPE "SeniorityLevel"[] USING ARRAY["seniorityLevel"],
ALTER COLUMN "educationLevel" SET DATA TYPE "ProfessionalEducationLevel"[] USING ARRAY["educationLevel"],
ALTER COLUMN "opportunityType" SET DATA TYPE "JobOpportunityType"[] USING ARRAY["opportunityType"];
