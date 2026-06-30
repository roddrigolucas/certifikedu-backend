/*
  Warnings:

  - You are about to drop the column `isCompleted` on the `UserMissionProgress` table. All the data in the column will be lost.
  - You are about to drop the column `missionTemplateId` on the `UserMissionProgress` table. All the data in the column will be lost.
  - You are about to drop the column `progressCount` on the `UserMissionProgress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profileId,missionId]` on the table `UserMissionProgress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `missionId` to the `UserMissionProgress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserMissionProgress" DROP CONSTRAINT "UserMissionProgress_missionTemplateId_fkey";

-- DropIndex
DROP INDEX "UserMissionProgress_profileId_missionTemplateId_key";

-- AlterTable
ALTER TABLE "MissionTemplate" ADD COLUMN     "referenceId" TEXT;

-- AlterTable
ALTER TABLE "UserMissionProgress" DROP COLUMN "isCompleted",
DROP COLUMN "missionTemplateId",
DROP COLUMN "progressCount",
ADD COLUMN     "currentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "missionId" TEXT NOT NULL,
ADD COLUMN     "status" "MissionStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- CreateIndex
CREATE UNIQUE INDEX "UserMissionProgress_profileId_missionId_key" ON "UserMissionProgress"("profileId", "missionId");

-- AddForeignKey
ALTER TABLE "UserMissionProgress" ADD CONSTRAINT "UserMissionProgress_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "MissionTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
