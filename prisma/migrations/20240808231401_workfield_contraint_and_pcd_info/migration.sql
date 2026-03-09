/*
  Warnings:

  - A unique constraint covering the columns `[workFieldId,jobOpportunityId]` on the table `WorkFieldOnJobOpportunity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workFieldId,professionalProfileId]` on the table `WorkFieldOnProfessionalProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workField]` on the table `WorkFields` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PCDInfo" AS ENUM ('PCD_EXCLUSIVE', 'PCD_DONT_ACCEPT', 'PCD_ACCEPT');

-- AlterTable
ALTER TABLE "JobOpportunity" ADD COLUMN     "pcdInfo" "PCDInfo" NOT NULL DEFAULT 'PCD_DONT_ACCEPT';

-- CreateIndex
CREATE UNIQUE INDEX "WorkFieldOnJobOpportunity_workFieldId_jobOpportunityId_key" ON "WorkFieldOnJobOpportunity"("workFieldId", "jobOpportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkFieldOnProfessionalProfile_workFieldId_professionalProf_key" ON "WorkFieldOnProfessionalProfile"("workFieldId", "professionalProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkFields_workField_key" ON "WorkFields"("workField");
