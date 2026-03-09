/*
  Warnings:

  - A unique constraint covering the columns `[jobCode]` on the table `JobOpportunity` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "JobOpportunity" ADD COLUMN     "jobCode" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "JobOpportunity_jobCode_key" ON "JobOpportunity"("jobCode");
