-- CreateEnum
CREATE TYPE "MissionTriggerType" AS ENUM ('CERTIFICATE_EMISSION', 'COURSE_COMPLETION', 'PATH_COMPLETION');

-- CreateEnum
CREATE TYPE "GamificationCategory" AS ENUM ('MISSION', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "MissiionStatus" AS ENUM ('MISSION', 'COMPLETED');

-- CreateTable
CREATE TABLE "GamificationProfile" (
    "id" TEXT NOT NULL,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "currentXP" INTEGER NOT NULL DEFAULT 0,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "currentTitle" TEXT NOT NULL DEFAULT 'Iniciante',
    "userId" TEXT NOT NULL,

    CONSTRAINT "GamificationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XpHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actionDescription" TEXT NOT NULL,
    "xpEarned" INTEGER NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "XpHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionTemplate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "category" "GamificationCategory" NOT NULL,
    "type" "MissionTriggerType" NOT NULL,
    "requiredCount" INTEGER NOT NULL DEFAULT 1,
    "schoolId" TEXT,

    CONSTRAINT "MissionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMissionProgress" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "progressCount" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "profileId" TEXT NOT NULL,
    "missionTemplateId" TEXT NOT NULL,

    CONSTRAINT "UserMissionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GamificationProfile_userId_key" ON "GamificationProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMissionProgress_profileId_missionTemplateId_key" ON "UserMissionProgress"("profileId", "missionTemplateId");

-- AddForeignKey
ALTER TABLE "GamificationProfile" ADD CONSTRAINT "GamificationProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpHistory" ADD CONSTRAINT "XpHistory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "GamificationProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionTemplate" ADD CONSTRAINT "MissionTemplate_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("schoolId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMissionProgress" ADD CONSTRAINT "UserMissionProgress_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "GamificationProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMissionProgress" ADD CONSTRAINT "UserMissionProgress_missionTemplateId_fkey" FOREIGN KEY ("missionTemplateId") REFERENCES "MissionTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
