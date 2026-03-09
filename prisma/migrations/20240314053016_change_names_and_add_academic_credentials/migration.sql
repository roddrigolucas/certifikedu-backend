/*
  Warnings:

  - You are about to drop the `Atividades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CurriculumAtividades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CurriculumEstagios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Disciplinas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Estagios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SemesterDisciplinas` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `educationLevel` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubjectTypeEnum" AS ENUM ('required', 'elective');

-- CreateEnum
CREATE TYPE "EducationLevelEnum" AS ENUM ('EducacaoInfantil', 'EnsinoFundamental', 'EnsinoMedio', 'Graduacao', 'GraduacaoTecnologica', 'PosGraduacao', 'Mestrado', 'Doutorado', 'PosDoutorado', 'Extensao', 'Profissionalizante', 'EmtemplateIdpresarial');

-- CreateEnum
CREATE TYPE "CredentialTypeEnum" AS ENUM ('PARECER', 'RESOLUCAO', 'DECRETO', 'PORTATIA', 'LEIFEDERAL', 'LEIESTADUAL', 'LEIMUNICIPAL', 'ATOPROPRIO', 'DELIBERACAO');

-- CreateEnum
CREATE TYPE "AcademicTypeEnum" AS ENUM ('EAD', 'PRESENCIAL');

-- DropForeignKey
ALTER TABLE "Atividades" DROP CONSTRAINT "Atividades_studyFieldId_fkey";

-- DropForeignKey
ALTER TABLE "Atividades" DROP CONSTRAINT "Atividades_userId_fkey";

-- DropForeignKey
ALTER TABLE "CurriculumAtividades" DROP CONSTRAINT "CurriculumAtividades_atividadeId_fkey";

-- DropForeignKey
ALTER TABLE "CurriculumAtividades" DROP CONSTRAINT "CurriculumAtividades_curriculumId_fkey";

-- DropForeignKey
ALTER TABLE "CurriculumEstagios" DROP CONSTRAINT "CurriculumEstagios_curriculumId_fkey";

-- DropForeignKey
ALTER TABLE "CurriculumEstagios" DROP CONSTRAINT "CurriculumEstagios_estagioId_fkey";

-- DropForeignKey
ALTER TABLE "Disciplinas" DROP CONSTRAINT "Disciplinas_studyFieldId_fkey";

-- DropForeignKey
ALTER TABLE "Disciplinas" DROP CONSTRAINT "Disciplinas_userId_fkey";

-- DropForeignKey
ALTER TABLE "Estagios" DROP CONSTRAINT "Estagios_studyFieldId_fkey";

-- DropForeignKey
ALTER TABLE "Estagios" DROP CONSTRAINT "Estagios_userId_fkey";

-- DropForeignKey
ALTER TABLE "SemesterDisciplinas" DROP CONSTRAINT "SemesterDisciplinas_disciplinaId_fkey";

-- DropForeignKey
ALTER TABLE "SemesterDisciplinas" DROP CONSTRAINT "SemesterDisciplinas_semesterId_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "description" TEXT,
ADD COLUMN     "educationLevel" "EducationLevelEnum" NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "Atividades";

-- DropTable
DROP TABLE "CurriculumAtividades";

-- DropTable
DROP TABLE "CurriculumEstagios";

-- DropTable
DROP TABLE "Disciplinas";

-- DropTable
DROP TABLE "Estagios";

-- DropTable
DROP TABLE "SemesterDisciplinas";

-- CreateTable
CREATE TABLE "AcademicCredentials" (
    "credentialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emecCode" TEXT NOT NULL,
    "type" "AcademicTypeEnum" NOT NULL,
    "number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "publishedDate" TIMESTAMP(3) NOT NULL,
    "publishingVehicle" TEXT NOT NULL,
    "publishingSection" TEXT NOT NULL,
    "publishingPage" TEXT NOT NULL,
    "numberDOU" INTEGER NOT NULL,
    "credentialType" "CredentialTypeEnum" NOT NULL,
    "courseId" TEXT,
    "schoolId" TEXT,

    CONSTRAINT "AcademicCredentials_pkey" PRIMARY KEY ("credentialId")
);

-- CreateTable
CREATE TABLE "SemesterSubjects" (
    "semesterSubjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "semesterId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    CONSTRAINT "SemesterSubjects_pkey" PRIMARY KEY ("semesterSubjectId")
);

-- CreateTable
CREATE TABLE "CurriculumInternships" (
    "semesterEstagioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "internshipId" TEXT NOT NULL,

    CONSTRAINT "CurriculumInternships_pkey" PRIMARY KEY ("semesterEstagioId")
);

-- CreateTable
CREATE TABLE "CurriculumActivities" (
    "semesterEstagioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "CurriculumActivities_pkey" PRIMARY KEY ("semesterEstagioId")
);

-- CreateTable
CREATE TABLE "Subjects" (
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalHoursWorkload" INTEGER NOT NULL,
    "praticalHoursWorkload" INTEGER NOT NULL,
    "teoricHoursWorkload" INTEGER NOT NULL,
    "eadHoursWorkload" INTEGER NOT NULL,
    "complementaryHoursWorkload" INTEGER NOT NULL,
    "type" "SubjectTypeEnum" NOT NULL,
    "studyFieldId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Subjects_pkey" PRIMARY KEY ("subjectId")
);

-- CreateTable
CREATE TABLE "Internships" (
    "internshipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hoursWorkload" INTEGER NOT NULL,
    "studyFieldId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Internships_pkey" PRIMARY KEY ("internshipId")
);

-- CreateTable
CREATE TABLE "Activities" (
    "activityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hoursWorkload" INTEGER NOT NULL,
    "studyFieldId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Activities_pkey" PRIMARY KEY ("activityId")
);

-- CreateTable
CREATE TABLE "CourseTemplates" (
    "courseTemplateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "CourseTemplates_pkey" PRIMARY KEY ("courseTemplateId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicCredentials_schoolId_key" ON "AcademicCredentials"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicCredentials_courseId_key" ON "AcademicCredentials"("courseId");

-- AddForeignKey
ALTER TABLE "AcademicCredentials" ADD CONSTRAINT "AcademicCredentials_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicCredentials" ADD CONSTRAINT "AcademicCredentials_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterSubjects" ADD CONSTRAINT "SemesterSubjects_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("semesterId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterSubjects" ADD CONSTRAINT "SemesterSubjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subjects"("subjectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumInternships" ADD CONSTRAINT "CurriculumInternships_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("curriculumId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumInternships" ADD CONSTRAINT "CurriculumInternships_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internships"("internshipId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumActivities" ADD CONSTRAINT "CurriculumActivities_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("curriculumId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumActivities" ADD CONSTRAINT "CurriculumActivities_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activities"("activityId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subjects" ADD CONSTRAINT "Subjects_studyFieldId_fkey" FOREIGN KEY ("studyFieldId") REFERENCES "StudyField"("studyFieldId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subjects" ADD CONSTRAINT "Subjects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internships" ADD CONSTRAINT "Internships_studyFieldId_fkey" FOREIGN KEY ("studyFieldId") REFERENCES "StudyField"("studyFieldId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internships" ADD CONSTRAINT "Internships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_studyFieldId_fkey" FOREIGN KEY ("studyFieldId") REFERENCES "StudyField"("studyFieldId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTemplates" ADD CONSTRAINT "CourseTemplates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTemplates" ADD CONSTRAINT "CourseTemplates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("templateId") ON DELETE CASCADE ON UPDATE CASCADE;
