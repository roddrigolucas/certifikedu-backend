/*
  Warnings:

  - You are about to drop the `MigrationTest` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "WorkModel" AS ENUM ('REMOTE', 'HYBRID', 'ON_SITE');

-- CreateEnum
CREATE TYPE "JobOpportunityType" AS ENUM ('APPRENTICESHIP', 'INTERNSHIP', 'PART_TIME', 'FULL_TIME', 'TEMPORARY', 'FREELANCER', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "JobOpportunityStatus" AS ENUM ('IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProfessionalEducationLevel" AS ENUM ('NONE', 'ELEMENTARY', 'HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'POSTDOCTORATE', 'VOCATIONAL', 'CERTIFICATION');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('JUNIOR', 'ANALIST', 'MID_LEVEL', 'SENIOR', 'MANAGER', 'COORDINATOR', 'DIRECTOR', 'EXECUTIVE');

-- AlterEnum
ALTER TYPE "PJAdminRoleEnum" ADD VALUE 'corporativo';

-- DropTable
DROP TABLE "MigrationTest";

-- CreateTable
CREATE TABLE "PessoaFisicaOnJobOpportunity" (
    "idPF" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "matchLevel" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PessoaFisicaOnJobOpportunity_pkey" PRIMARY KEY ("idPF","jobId")
);

-- CreateTable
CREATE TABLE "CorporateAdmins" (
    "idCorporateAdmin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "PJAssociationStatus" NOT NULL DEFAULT 'REVIEW',
    "role" "PJAdminRoleEnum" NOT NULL,
    "idPF" TEXT NOT NULL,
    "idPJ" TEXT NOT NULL,

    CONSTRAINT "CorporateAdmins_pkey" PRIMARY KEY ("idCorporateAdmin")
);

-- CreateTable
CREATE TABLE "AbilityOnJobOpportunity" (
    "habilidadeId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "WorkFields" (
    "workFieldId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workField" TEXT NOT NULL,

    CONSTRAINT "WorkFields_pkey" PRIMARY KEY ("workFieldId")
);

-- CreateTable
CREATE TABLE "WorkFieldOnProfessionalProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workFieldId" TEXT NOT NULL,
    "professionalProfileId" TEXT NOT NULL,

    CONSTRAINT "WorkFieldOnProfessionalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkFieldOnJobOpportunity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workFieldId" TEXT NOT NULL,
    "jobOpportunityId" TEXT NOT NULL,

    CONSTRAINT "WorkFieldOnJobOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOpportunity" (
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT,
    "workModel" "WorkModel" NOT NULL,
    "type" "JobOpportunityType" NOT NULL,
    "status" "JobOpportunityStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "pjId" TEXT NOT NULL,
    "minimumExperienceLevel" INTEGER,
    "maximumExperienceLevel" INTEGER,
    "minimumSalaryRange" DOUBLE PRECISION,
    "maximumSalaryRange" DOUBLE PRECISION,
    "seniorityLevel" "SeniorityLevel",
    "educationLevel" "ProfessionalEducationLevel",

    CONSTRAINT "JobOpportunity_pkey" PRIMARY KEY ("jobId")
);

-- CreateTable
CREATE TABLE "AbilitiesOnProfessionalProfile" (
    "abilityOnProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "abilityId" TEXT NOT NULL,
    "professionalProfileId" TEXT NOT NULL,

    CONSTRAINT "AbilitiesOnProfessionalProfile_pkey" PRIMARY KEY ("abilityOnProfileId")
);

-- CreateTable
CREATE TABLE "ProfessionalProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "idPF" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "yearsOfExperience" INTEGER NOT NULL,
    "seniorityLevel" "SeniorityLevel" NOT NULL,
    "educationLevel" "ProfessionalEducationLevel" NOT NULL,
    "workModel" "WorkModel"[],
    "opportunityType" "JobOpportunityType" NOT NULL,
    "openToWork" BOOLEAN NOT NULL,

    CONSTRAINT "ProfessionalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AbilityOnJobOpportunity_habilidadeId_jobId_key" ON "AbilityOnJobOpportunity"("habilidadeId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "JobOpportunity_pjId_jobId_key" ON "JobOpportunity"("pjId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalProfile_idPF_key" ON "ProfessionalProfile"("idPF");

-- AddForeignKey
ALTER TABLE "PessoaFisicaOnJobOpportunity" ADD CONSTRAINT "PessoaFisicaOnJobOpportunity_idPF_fkey" FOREIGN KEY ("idPF") REFERENCES "PessoaFisica"("idPF") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PessoaFisicaOnJobOpportunity" ADD CONSTRAINT "PessoaFisicaOnJobOpportunity_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobOpportunity"("jobId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateAdmins" ADD CONSTRAINT "CorporateAdmins_idPF_fkey" FOREIGN KEY ("idPF") REFERENCES "PessoaFisica"("idPF") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateAdmins" ADD CONSTRAINT "CorporateAdmins_idPJ_fkey" FOREIGN KEY ("idPJ") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityOnJobOpportunity" ADD CONSTRAINT "AbilityOnJobOpportunity_habilidadeId_fkey" FOREIGN KEY ("habilidadeId") REFERENCES "Abilities"("habilidadeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityOnJobOpportunity" ADD CONSTRAINT "AbilityOnJobOpportunity_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobOpportunity"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkFieldOnProfessionalProfile" ADD CONSTRAINT "WorkFieldOnProfessionalProfile_workFieldId_fkey" FOREIGN KEY ("workFieldId") REFERENCES "WorkFields"("workFieldId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkFieldOnProfessionalProfile" ADD CONSTRAINT "WorkFieldOnProfessionalProfile_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkFieldOnJobOpportunity" ADD CONSTRAINT "WorkFieldOnJobOpportunity_workFieldId_fkey" FOREIGN KEY ("workFieldId") REFERENCES "WorkFields"("workFieldId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkFieldOnJobOpportunity" ADD CONSTRAINT "WorkFieldOnJobOpportunity_jobOpportunityId_fkey" FOREIGN KEY ("jobOpportunityId") REFERENCES "JobOpportunity"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOpportunity" ADD CONSTRAINT "JobOpportunity_pjId_fkey" FOREIGN KEY ("pjId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilitiesOnProfessionalProfile" ADD CONSTRAINT "AbilitiesOnProfessionalProfile_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Abilities"("habilidadeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilitiesOnProfessionalProfile" ADD CONSTRAINT "AbilitiesOnProfessionalProfile_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalProfile" ADD CONSTRAINT "ProfessionalProfile_idPF_fkey" FOREIGN KEY ("idPF") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;
