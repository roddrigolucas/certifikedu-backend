/*
  Warnings:

  - You are about to drop the column `isDefault` on the `PagarmePlans` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `certificates` table. All the data in the column will be lost.
  - You are about to drop the column `planDefault` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `CourseAbilities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Courses` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userPlanId]` on the table `PagarmePlanSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userPlanId` to the `PagarmePlanSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourseAbilities" DROP CONSTRAINT "CourseAbilities_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseAbilities" DROP CONSTRAINT "CourseAbilities_habilidadeId_fkey";

-- DropForeignKey
ALTER TABLE "Courses" DROP CONSTRAINT "Courses_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_courseId_fkey";

-- AlterTable
ALTER TABLE "PagarmePlanSubscription" ADD COLUMN     "userPlanId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PagarmePlans" DROP COLUMN "isDefault";

-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "courseId",
ADD COLUMN     "basicSubscriptionId" TEXT,
ADD COLUMN     "templateId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "planDefault";

-- DropTable
DROP TABLE "CourseAbilities";

-- DropTable
DROP TABLE "Courses";

-- CreateTable
CREATE TABLE "SchoolsCourses" (
    "schoolCourseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "SchoolsCourses_pkey" PRIMARY KEY ("schoolCourseId")
);

-- CreateTable
CREATE TABLE "Course" (
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("courseId")
);

-- CreateTable
CREATE TABLE "Curriculum" (
    "curriculumId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredHoursWorkload" INTEGER NOT NULL,
    "electiveHoursWorkload" INTEGER NOT NULL,
    "complementaryHoursWorkload" INTEGER NOT NULL,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("curriculumId")
);

-- CreateTable
CREATE TABLE "Semester" (
    "semesterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "semesterNumber" INTEGER NOT NULL,
    "requiredHoursWorkload" INTEGER NOT NULL,
    "electiveHoursWorkload" INTEGER NOT NULL,
    "complementaryHoursWorkload" INTEGER NOT NULL,
    "curriculumId" TEXT NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("semesterId")
);

-- CreateTable
CREATE TABLE "SemesterDisciplinas" (
    "semesterDisciplinaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "semesterId" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,

    CONSTRAINT "SemesterDisciplinas_pkey" PRIMARY KEY ("semesterDisciplinaId")
);

-- CreateTable
CREATE TABLE "CurriculumEstagios" (
    "semesterEstagioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "estagioId" TEXT NOT NULL,

    CONSTRAINT "CurriculumEstagios_pkey" PRIMARY KEY ("semesterEstagioId")
);

-- CreateTable
CREATE TABLE "CurriculumAtividades" (
    "semesterEstagioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "atividadeId" TEXT NOT NULL,

    CONSTRAINT "CurriculumAtividades_pkey" PRIMARY KEY ("semesterEstagioId")
);

-- CreateTable
CREATE TABLE "Disciplinas" (
    "disciplinaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hoursWorkload" INTEGER NOT NULL,
    "studyFieldId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Disciplinas_pkey" PRIMARY KEY ("disciplinaId")
);

-- CreateTable
CREATE TABLE "Estagios" (
    "estagioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hoursWorkload" INTEGER NOT NULL,
    "studyFieldId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Estagios_pkey" PRIMARY KEY ("estagioId")
);

-- CreateTable
CREATE TABLE "Atividades" (
    "atividadeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hoursWorkload" INTEGER NOT NULL,
    "studyFieldId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Atividades_pkey" PRIMARY KEY ("atividadeId")
);

-- CreateTable
CREATE TABLE "StudyFieldAbilitites" (
    "atividadeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studyFieldId" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,

    CONSTRAINT "StudyFieldAbilitites_pkey" PRIMARY KEY ("atividadeId")
);

-- CreateTable
CREATE TABLE "StudyField" (
    "studyFieldId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StudyField_pkey" PRIMARY KEY ("studyFieldId")
);

-- CreateTable
CREATE TABLE "Templates" (
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logoImage" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,
    "certificatePicture" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "Templates_pkey" PRIMARY KEY ("templateId")
);

-- CreateTable
CREATE TABLE "TemplateAbilities" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "habilidadeId" TEXT NOT NULL,

    CONSTRAINT "TemplateAbilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlans" (
    "userPlanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BasicPlanSubscriptions" (
    "userSubscriptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cycleStart" TIMESTAMP(3) NOT NULL,
    "cycleEnd" TIMESTAMP(3) NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "userPlanId" TEXT NOT NULL,
    "planId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BasicPlans" (
    "planId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "pdisQty" INTEGER NOT NULL,
    "pdiPeriod" "QuotaPeriod" NOT NULL,
    "emittedCertificatesQuota" INTEGER NOT NULL,
    "emittedCertificatesPeriod" "QuotaPeriod" NOT NULL,
    "receivedCertificateQuota" INTEGER NOT NULL,
    "receivedCertificatePeriod" "QuotaPeriod" NOT NULL,
    "singleCertificatePrice" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Semester_semesterNumber_curriculumId_key" ON "Semester"("semesterNumber", "curriculumId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateAbilities_templateId_habilidadeId_key" ON "TemplateAbilities"("templateId", "habilidadeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlans_userPlanId_key" ON "UserPlans"("userPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "BasicPlanSubscriptions_userSubscriptionId_key" ON "BasicPlanSubscriptions"("userSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "BasicPlanSubscriptions_userPlanId_key" ON "BasicPlanSubscriptions"("userPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "BasicPlans_planId_key" ON "BasicPlans"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmePlanSubscription_userPlanId_key" ON "PagarmePlanSubscription"("userPlanId");

-- AddForeignKey
ALTER TABLE "SchoolsCourses" ADD CONSTRAINT "SchoolsCourses_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolsCourses" ADD CONSTRAINT "SchoolsCourses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curriculum" ADD CONSTRAINT "Curriculum_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("curriculumId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterDisciplinas" ADD CONSTRAINT "SemesterDisciplinas_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("semesterId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterDisciplinas" ADD CONSTRAINT "SemesterDisciplinas_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplinas"("disciplinaId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumEstagios" ADD CONSTRAINT "CurriculumEstagios_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("curriculumId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumEstagios" ADD CONSTRAINT "CurriculumEstagios_estagioId_fkey" FOREIGN KEY ("estagioId") REFERENCES "Estagios"("estagioId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumAtividades" ADD CONSTRAINT "CurriculumAtividades_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("curriculumId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumAtividades" ADD CONSTRAINT "CurriculumAtividades_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "Atividades"("atividadeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disciplinas" ADD CONSTRAINT "Disciplinas_studyFieldId_fkey" FOREIGN KEY ("studyFieldId") REFERENCES "StudyField"("studyFieldId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disciplinas" ADD CONSTRAINT "Disciplinas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estagios" ADD CONSTRAINT "Estagios_studyFieldId_fkey" FOREIGN KEY ("studyFieldId") REFERENCES "StudyField"("studyFieldId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estagios" ADD CONSTRAINT "Estagios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atividades" ADD CONSTRAINT "Atividades_studyFieldId_fkey" FOREIGN KEY ("studyFieldId") REFERENCES "StudyField"("studyFieldId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atividades" ADD CONSTRAINT "Atividades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyFieldAbilitites" ADD CONSTRAINT "StudyFieldAbilitites_studyFieldId_fkey" FOREIGN KEY ("studyFieldId") REFERENCES "StudyField"("studyFieldId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyFieldAbilitites" ADD CONSTRAINT "StudyFieldAbilitites_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Abilities"("habilidadeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyField" ADD CONSTRAINT "StudyField_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateAbilities" ADD CONSTRAINT "TemplateAbilities_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("templateId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateAbilities" ADD CONSTRAINT "TemplateAbilities_habilidadeId_fkey" FOREIGN KEY ("habilidadeId") REFERENCES "Abilities"("habilidadeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_basicSubscriptionId_fkey" FOREIGN KEY ("basicSubscriptionId") REFERENCES "BasicPlanSubscriptions"("userSubscriptionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlans" ADD CONSTRAINT "UserPlans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasicPlanSubscriptions" ADD CONSTRAINT "BasicPlanSubscriptions_userPlanId_fkey" FOREIGN KEY ("userPlanId") REFERENCES "UserPlans"("userPlanId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasicPlanSubscriptions" ADD CONSTRAINT "BasicPlanSubscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BasicPlans"("planId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmePlanSubscription" ADD CONSTRAINT "PagarmePlanSubscription_userPlanId_fkey" FOREIGN KEY ("userPlanId") REFERENCES "UserPlans"("userPlanId") ON DELETE CASCADE ON UPDATE CASCADE;
