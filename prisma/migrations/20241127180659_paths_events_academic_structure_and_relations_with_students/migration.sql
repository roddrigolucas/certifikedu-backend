/*
  Warnings:

  - You are about to drop the column `badgeLogoId` on the `certificates` table. All the data in the column will be lost.
  - You are about to drop the `BadgeLogos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PdiA3` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[templateId]` on the table `Activities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[backgroundId,imageUrl]` on the table `BackgroundCertificateImages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[templateId]` on the table `Curriculum` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[templateId]` on the table `Internships` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[templateId]` on the table `Semester` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[templateId]` on the table `StudyField` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[templateId]` on the table `Subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "BadgeLogos" DROP CONSTRAINT "BadgeLogos_userId_fkey";

-- DropForeignKey
ALTER TABLE "PdiA3" DROP CONSTRAINT "PdiA3_userId_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_badgeLogoId_fkey";

-- AlterTable
ALTER TABLE "Activities" ADD COLUMN     "templateId" TEXT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "isAcademic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Curriculum" ADD COLUMN     "templateId" TEXT,
ALTER COLUMN "electiveHoursWorkload" DROP NOT NULL,
ALTER COLUMN "complementaryHoursWorkload" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Internships" ADD COLUMN     "templateId" TEXT;

-- AlterTable
ALTER TABLE "Semester" ADD COLUMN     "templateId" TEXT,
ALTER COLUMN "electiveHoursWorkload" DROP NOT NULL,
ALTER COLUMN "complementaryHoursWorkload" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StudyField" ADD COLUMN     "templateId" TEXT;

-- AlterTable
ALTER TABLE "Subjects" ADD COLUMN     "templateId" TEXT,
ALTER COLUMN "praticalHoursWorkload" DROP NOT NULL,
ALTER COLUMN "teoricHoursWorkload" DROP NOT NULL,
ALTER COLUMN "eadHoursWorkload" DROP NOT NULL,
ALTER COLUMN "complementaryHoursWorkload" DROP NOT NULL;

-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "badgeLogoId",
ADD COLUMN     "eventId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "freeEvents" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "BadgeLogos";

-- DropTable
DROP TABLE "PdiA3";

-- CreateTable
CREATE TABLE "InstitutionalEvents" (
    "institutionalEventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "hoursWorkload" INTEGER NOT NULL,
    "educationLevel" "EducationLevelEnum" NOT NULL,
    "templateId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "InstitutionalEvents_pkey" PRIMARY KEY ("institutionalEventId")
);

-- CreateTable
CREATE TABLE "InstitutionalEventsAbilities" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institutionalEventId" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,

    CONSTRAINT "InstitutionalEventsAbilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Events" (
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logoImage" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionImage" TEXT NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,
    "certificatePicture" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "hexFontColor" TEXT,
    "backgroundId" TEXT,
    "backgroungImageUrl" TEXT,
    "qrCodePosition" "QRCodePositionEnum" NOT NULL DEFAULT 'NULL',
    "fontVariantsIdDescription" TEXT,
    "fontVariantsIdName" TEXT,
    "issuesNumberLimit" INTEGER,
    "startDateTime" TIMESTAMP(3),
    "expirationDateTime" TIMESTAMP(3),
    "hasOrder" BOOLEAN NOT NULL,
    "orderId" TEXT,
    "customerId" TEXT NOT NULL,
    "issuerId" TEXT NOT NULL,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "EventsAllowedDocuments" (
    "allowId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "document" TEXT NOT NULL,
    "hasReceived" BOOLEAN NOT NULL DEFAULT false,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "EventsAllowedDocuments_pkey" PRIMARY KEY ("allowId")
);

-- CreateTable
CREATE TABLE "EventAbilities" (
    "eventAbilitieId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,

    CONSTRAINT "EventAbilities_pkey" PRIMARY KEY ("eventAbilitieId")
);

-- CreateTable
CREATE TABLE "EventAbilitiesOnReview" (
    "eventAbilitieId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,
    "abilityOnReviewId" TEXT NOT NULL,

    CONSTRAINT "EventAbilitiesOnReview_pkey" PRIMARY KEY ("eventAbilitieId")
);

-- CreateTable
CREATE TABLE "LearningPaths" (
    "pathId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalHoursWorkload" INTEGER,
    "templateId" TEXT,
    "pjId" TEXT NOT NULL,

    CONSTRAINT "LearningPaths_pkey" PRIMARY KEY ("pathId")
);

-- CreateTable
CREATE TABLE "LearningPathsModules" (
    "moduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moduleIndex" INTEGER NOT NULL,
    "templateId" TEXT,
    "pathId" TEXT NOT NULL,

    CONSTRAINT "LearningPathsModules_pkey" PRIMARY KEY ("moduleId")
);

-- CreateTable
CREATE TABLE "LearningPathsActivities" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activityId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "moduleIndex" INTEGER NOT NULL,

    CONSTRAINT "LearningPathsActivities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathsInternships" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "internshipId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "moduleIndex" INTEGER NOT NULL,

    CONSTRAINT "LearningPathsInternships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathsSubject" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subjectId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "moduleIndex" INTEGER NOT NULL,

    CONSTRAINT "LearningPathsSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathsInstitutionalEvents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institutionalEventsId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "moduleIndex" INTEGER NOT NULL,

    CONSTRAINT "LearningPathsInstitutionalEvents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventParticipants" (
    "participantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "document" TEXT NOT NULL,
    "hasReceived" BOOLEAN NOT NULL DEFAULT false,
    "idPf" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "EventParticipants_pkey" PRIMARY KEY ("participantId")
);

-- CreateTable
CREATE TABLE "CurriculumStudents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "curriculumId" TEXT NOT NULL,
    "idPf" TEXT NOT NULL,

    CONSTRAINT "CurriculumStudents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemesterStudents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "semesterId" TEXT NOT NULL,
    "idPf" TEXT NOT NULL,

    CONSTRAINT "SemesterStudents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectStudents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "subjectId" TEXT NOT NULL,
    "idPf" TEXT NOT NULL,

    CONSTRAINT "SubjectStudents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternshipsStudents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "internshipId" TEXT NOT NULL,
    "idPf" TEXT NOT NULL,

    CONSTRAINT "InternshipsStudents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitiesStudents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "activityId" TEXT NOT NULL,
    "idPf" TEXT NOT NULL,

    CONSTRAINT "ActivitiesStudents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionalEventsStudents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "idPf" TEXT NOT NULL,
    "institutionalEventId" TEXT NOT NULL,

    CONSTRAINT "InstitutionalEventsStudents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathModulesStudents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "moduleId" TEXT NOT NULL,
    "moduleIndex" INTEGER NOT NULL,
    "pathStudentId" TEXT NOT NULL,

    CONSTRAINT "LearningPathModulesStudents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathsStudents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "idPf" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,

    CONSTRAINT "LearningPathsStudents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionalEvents_templateId_key" ON "InstitutionalEvents"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "Events_backgroundId_key" ON "Events"("backgroundId");

-- CreateIndex
CREATE UNIQUE INDEX "Events_backgroungImageUrl_key" ON "Events"("backgroungImageUrl");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPaths_templateId_key" ON "LearningPaths"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPathsModules_templateId_key" ON "LearningPathsModules"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPathsModules_pathId_moduleIndex_key" ON "LearningPathsModules"("pathId", "moduleIndex");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPathsModules_moduleId_moduleIndex_key" ON "LearningPathsModules"("moduleId", "moduleIndex");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipants_idPf_eventId_key" ON "EventParticipants"("idPf", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPathModulesStudents_moduleId_moduleIndex_key" ON "LearningPathModulesStudents"("moduleId", "moduleIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Activities_templateId_key" ON "Activities"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "BackgroundCertificateImages_backgroundId_imageUrl_key" ON "BackgroundCertificateImages"("backgroundId", "imageUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Curriculum_templateId_key" ON "Curriculum"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "Internships_templateId_key" ON "Internships"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_templateId_key" ON "Semester"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyField_templateId_key" ON "StudyField"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "Subjects_templateId_key" ON "Subjects"("templateId");

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("eventId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curriculum" ADD CONSTRAINT "Curriculum_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subjects" ADD CONSTRAINT "Subjects_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internships" ADD CONSTRAINT "Internships_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyField" ADD CONSTRAINT "StudyField_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionalEvents" ADD CONSTRAINT "InstitutionalEvents_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionalEvents" ADD CONSTRAINT "InstitutionalEvents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionalEventsAbilities" ADD CONSTRAINT "InstitutionalEventsAbilities_institutionalEventId_fkey" FOREIGN KEY ("institutionalEventId") REFERENCES "InstitutionalEvents"("institutionalEventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionalEventsAbilities" ADD CONSTRAINT "InstitutionalEventsAbilities_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Abilities"("habilidadeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_backgroundId_backgroungImageUrl_fkey" FOREIGN KEY ("backgroundId", "backgroungImageUrl") REFERENCES "BackgroundCertificateImages"("backgroundId", "imageUrl") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_fontVariantsIdDescription_fkey" FOREIGN KEY ("fontVariantsIdDescription") REFERENCES "FontsVariants"("fontVariantsId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_fontVariantsIdName_fkey" FOREIGN KEY ("fontVariantsIdName") REFERENCES "FontsVariants"("fontVariantsId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PagarmeOrders"("orderId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "PagarmeCustomers"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventsAllowedDocuments" ADD CONSTRAINT "EventsAllowedDocuments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAbilities" ADD CONSTRAINT "EventAbilities_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAbilities" ADD CONSTRAINT "EventAbilities_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Abilities"("habilidadeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAbilitiesOnReview" ADD CONSTRAINT "EventAbilitiesOnReview_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAbilitiesOnReview" ADD CONSTRAINT "EventAbilitiesOnReview_abilityOnReviewId_fkey" FOREIGN KEY ("abilityOnReviewId") REFERENCES "AbilityOnReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPaths" ADD CONSTRAINT "LearningPaths_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPaths" ADD CONSTRAINT "LearningPaths_pjId_fkey" FOREIGN KEY ("pjId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathsModules" ADD CONSTRAINT "LearningPathsModules_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathsModules" ADD CONSTRAINT "LearningPathsModules_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "LearningPaths"("pathId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathsActivities" ADD CONSTRAINT "LearningPathsActivities_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activities"("activityId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathsActivities" ADD CONSTRAINT "LearningPathsActivities_moduleId_moduleIndex_fkey" FOREIGN KEY ("moduleId", "moduleIndex") REFERENCES "LearningPathsModules"("moduleId", "moduleIndex") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathsInternships" ADD CONSTRAINT "LearningPathsInternships_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internships"("internshipId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathsInternships" ADD CONSTRAINT "LearningPathsInternships_moduleId_moduleIndex_fkey" FOREIGN KEY ("moduleId", "moduleIndex") REFERENCES "LearningPathsModules"("moduleId", "moduleIndex") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathsSubject" ADD CONSTRAINT "LearningPathsSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subjects"("subjectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathsSubject" ADD CONSTRAINT "LearningPathsSubject_moduleId_moduleIndex_fkey" FOREIGN KEY ("moduleId", "moduleIndex") REFERENCES "LearningPathsModules"("moduleId", "moduleIndex") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathsInstitutionalEvents" ADD CONSTRAINT "LearningPathsInstitutionalEvents_institutionalEventsId_fkey" FOREIGN KEY ("institutionalEventsId") REFERENCES "InstitutionalEvents"("institutionalEventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathsInstitutionalEvents" ADD CONSTRAINT "LearningPathsInstitutionalEvents_moduleId_moduleIndex_fkey" FOREIGN KEY ("moduleId", "moduleIndex") REFERENCES "LearningPathsModules"("moduleId", "moduleIndex") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipants" ADD CONSTRAINT "EventParticipants_idPf_fkey" FOREIGN KEY ("idPf") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipants" ADD CONSTRAINT "EventParticipants_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumStudents" ADD CONSTRAINT "CurriculumStudents_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("curriculumId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumStudents" ADD CONSTRAINT "CurriculumStudents_idPf_fkey" FOREIGN KEY ("idPf") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterStudents" ADD CONSTRAINT "SemesterStudents_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("semesterId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterStudents" ADD CONSTRAINT "SemesterStudents_idPf_fkey" FOREIGN KEY ("idPf") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectStudents" ADD CONSTRAINT "SubjectStudents_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subjects"("subjectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectStudents" ADD CONSTRAINT "SubjectStudents_idPf_fkey" FOREIGN KEY ("idPf") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipsStudents" ADD CONSTRAINT "InternshipsStudents_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internships"("internshipId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipsStudents" ADD CONSTRAINT "InternshipsStudents_idPf_fkey" FOREIGN KEY ("idPf") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitiesStudents" ADD CONSTRAINT "ActivitiesStudents_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activities"("activityId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitiesStudents" ADD CONSTRAINT "ActivitiesStudents_idPf_fkey" FOREIGN KEY ("idPf") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionalEventsStudents" ADD CONSTRAINT "InstitutionalEventsStudents_idPf_fkey" FOREIGN KEY ("idPf") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionalEventsStudents" ADD CONSTRAINT "InstitutionalEventsStudents_institutionalEventId_fkey" FOREIGN KEY ("institutionalEventId") REFERENCES "InstitutionalEvents"("institutionalEventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathModulesStudents" ADD CONSTRAINT "LearningPathModulesStudents_moduleId_moduleIndex_fkey" FOREIGN KEY ("moduleId", "moduleIndex") REFERENCES "LearningPathsModules"("moduleId", "moduleIndex") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathModulesStudents" ADD CONSTRAINT "LearningPathModulesStudents_pathStudentId_fkey" FOREIGN KEY ("pathStudentId") REFERENCES "LearningPathsStudents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathsStudents" ADD CONSTRAINT "LearningPathsStudents_idPf_fkey" FOREIGN KEY ("idPf") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathsStudents" ADD CONSTRAINT "LearningPathsStudents_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "LearningPaths"("pathId") ON DELETE CASCADE ON UPDATE CASCADE;
