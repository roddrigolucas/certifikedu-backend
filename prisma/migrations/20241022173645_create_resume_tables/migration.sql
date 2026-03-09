-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'SELF_EMPLOYED', 'FREELANCE', 'CONTRACT', 'APPRENTICESHIP', 'INTERNSHIP', 'LEADERSHIP_PROGRAM', 'INDIRECT_CONTRACT');

-- CreateEnum
CREATE TYPE "ResumeLanguageLevel" AS ENUM ('ELEMENTARY', 'LIMITED_WORKING', 'PROFESSIONAL_WORKING', 'FULL_PROFESSIONAL_WORKING', 'NATIVE');

-- CreateTable
CREATE TABLE "RawPJ" (
    "rawPJId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "cnpj" TEXT,
    "location" TEXT,
    "idPJ" TEXT,

    CONSTRAINT "RawPJ_pkey" PRIMARY KEY ("rawPJId")
);

-- CreateTable
CREATE TABLE "Resume" (
    "resumeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "idPF" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "basicSubscriptionId" TEXT,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("resumeId")
);

-- CreateTable
CREATE TABLE "ResumeExperience" (
    "resumeExperienceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startYear" INTEGER NOT NULL,
    "startMonth" INTEGER NOT NULL,
    "endYear" INTEGER,
    "endMonth" INTEGER,
    "employmentType" "EmploymentType" NOT NULL,
    "workModel" "WorkModel" NOT NULL,
    "rawPJId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,

    CONSTRAINT "ResumeExperience_pkey" PRIMARY KEY ("resumeExperienceId")
);

-- CreateTable
CREATE TABLE "ResumeLanguage" (
    "resumeLanguageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "language" TEXT NOT NULL,
    "level" "ResumeLanguageLevel" NOT NULL,
    "resumeId" TEXT NOT NULL,

    CONSTRAINT "ResumeLanguage_pkey" PRIMARY KEY ("resumeLanguageId")
);

-- CreateTable
CREATE TABLE "ResumeExperienceCertificate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resumeExperienceId" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,

    CONSTRAINT "ResumeExperienceCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeEducation" (
    "resumeEducationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startYear" INTEGER NOT NULL,
    "startMonth" INTEGER NOT NULL,
    "endYear" INTEGER,
    "endMonth" INTEGER,
    "rawPJId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,

    CONSTRAINT "ResumeEducation_pkey" PRIMARY KEY ("resumeEducationId")
);

-- CreateTable
CREATE TABLE "ResumeEducationCertificate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resumeEducationId" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,

    CONSTRAINT "ResumeEducationCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeLanguageCertificate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resumeLanguageId" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,

    CONSTRAINT "ResumeLanguageCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RawPJ_name_key" ON "RawPJ"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeExperienceCertificate_resumeExperienceId_certificateI_key" ON "ResumeExperienceCertificate"("resumeExperienceId", "certificateId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeEducationCertificate_resumeEducationId_certificateId_key" ON "ResumeEducationCertificate"("resumeEducationId", "certificateId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeLanguageCertificate_resumeLanguageId_certificateId_key" ON "ResumeLanguageCertificate"("resumeLanguageId", "certificateId");

-- AddForeignKey
ALTER TABLE "RawPJ" ADD CONSTRAINT "RawPJ_idPJ_fkey" FOREIGN KEY ("idPJ") REFERENCES "PessoaJuridica"("idPJ") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_idPF_fkey" FOREIGN KEY ("idPF") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "PagarmePlanSubscription"("subscriptionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_basicSubscriptionId_fkey" FOREIGN KEY ("basicSubscriptionId") REFERENCES "BasicPlanSubscriptions"("userSubscriptionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeExperience" ADD CONSTRAINT "ResumeExperience_rawPJId_fkey" FOREIGN KEY ("rawPJId") REFERENCES "RawPJ"("rawPJId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeExperience" ADD CONSTRAINT "ResumeExperience_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("resumeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeLanguage" ADD CONSTRAINT "ResumeLanguage_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("resumeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeExperienceCertificate" ADD CONSTRAINT "ResumeExperienceCertificate_resumeExperienceId_fkey" FOREIGN KEY ("resumeExperienceId") REFERENCES "ResumeExperience"("resumeExperienceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeExperienceCertificate" ADD CONSTRAINT "ResumeExperienceCertificate_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeEducation" ADD CONSTRAINT "ResumeEducation_rawPJId_fkey" FOREIGN KEY ("rawPJId") REFERENCES "RawPJ"("rawPJId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeEducation" ADD CONSTRAINT "ResumeEducation_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("resumeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeEducationCertificate" ADD CONSTRAINT "ResumeEducationCertificate_resumeEducationId_fkey" FOREIGN KEY ("resumeEducationId") REFERENCES "ResumeEducation"("resumeEducationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeEducationCertificate" ADD CONSTRAINT "ResumeEducationCertificate_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeLanguageCertificate" ADD CONSTRAINT "ResumeLanguageCertificate_resumeLanguageId_fkey" FOREIGN KEY ("resumeLanguageId") REFERENCES "ResumeLanguage"("resumeLanguageId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeLanguageCertificate" ADD CONSTRAINT "ResumeLanguageCertificate_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE CASCADE ON UPDATE CASCADE;
