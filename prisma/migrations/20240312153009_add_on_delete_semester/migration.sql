/*
  Warnings:

  - The primary key for the `StudyFieldAbilitites` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `atividadeId` on the `StudyFieldAbilitites` table. All the data in the column will be lost.
  - The required column `studyFieldAbilityId` was added to the `StudyFieldAbilitites` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Semester" DROP CONSTRAINT "Semester_curriculumId_fkey";

-- AlterTable
ALTER TABLE "StudyFieldAbilitites" DROP CONSTRAINT "StudyFieldAbilitites_pkey",
DROP COLUMN "atividadeId",
ADD COLUMN     "studyFieldAbilityId" TEXT NOT NULL,
ADD CONSTRAINT "StudyFieldAbilitites_pkey" PRIMARY KEY ("studyFieldAbilityId");

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("curriculumId") ON DELETE CASCADE ON UPDATE CASCADE;
