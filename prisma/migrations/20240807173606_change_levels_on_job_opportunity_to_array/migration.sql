/*
  Warnings:

  - Changed the column `seniorityLevel` on the `JobOpportunity` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
  - Changed the column `educationLevel` on the `JobOpportunity` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
ALTER TABLE "JobOpportunity" ALTER COLUMN "seniorityLevel" SET DATA TYPE "SeniorityLevel"[] USING ARRAY["seniorityLevel"],
ALTER COLUMN "educationLevel" SET DATA TYPE "ProfessionalEducationLevel"[] USING ARRAY["educationLevel"];
