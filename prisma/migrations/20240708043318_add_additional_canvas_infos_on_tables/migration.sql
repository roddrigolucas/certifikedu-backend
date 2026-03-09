/*
  Warnings:

  - You are about to drop the column `email` on the `CanvasToken` table. All the data in the column will be lost.
  - You are about to drop the column `tokenExp` on the `CanvasToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[canvasDomain]` on the table `CanvasLTIConfiguration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[canvasUserId,canvasDomain]` on the table `CanvasToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[canvasUserId,canvasDomain]` on the table `CanvasUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `canvasClientSecretLTI` to the `CanvasLTIConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `canvasDomain` to the `CanvasToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `canvasUserId` to the `CanvasToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `CanvasToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenExpiration` to the `CanvasToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isTeacher` to the `CanvasUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CanvasLoginIntents" DROP CONSTRAINT "CanvasLoginIntents_canvasLTIConfigurationId_fkey";

-- DropIndex
DROP INDEX "CanvasToken_email_key";

-- AlterTable
ALTER TABLE "CanvasLTIConfiguration" ADD COLUMN     "canvasClientSecretLTI" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CanvasLoginIntents" ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "ltiLaunchInfo" JSONB NOT NULL DEFAULT '{}',
ADD CONSTRAINT "CanvasLoginIntents_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "CanvasToken" DROP COLUMN "email",
DROP COLUMN "tokenExp",
ADD COLUMN     "canvasDomain" TEXT NOT NULL,
ADD COLUMN     "canvasUserId" INTEGER NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "refreshToken" TEXT NOT NULL,
ADD COLUMN     "tokenExpiration" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "CanvasToken_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "CanvasUser" ADD COLUMN     "isTeacher" BOOLEAN NOT NULL,
ADD COLUMN     "tempDocument" TEXT,
ALTER COLUMN "idPF" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "fromCanvas" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "CanvasLTIConfiguration_canvasDomain_key" ON "CanvasLTIConfiguration"("canvasDomain");

-- CreateIndex
CREATE UNIQUE INDEX "CanvasToken_canvasUserId_canvasDomain_key" ON "CanvasToken"("canvasUserId", "canvasDomain");

-- CreateIndex
CREATE UNIQUE INDEX "CanvasUser_canvasUserId_canvasDomain_key" ON "CanvasUser"("canvasUserId", "canvasDomain");

-- AddForeignKey
ALTER TABLE "CanvasLoginIntents" ADD CONSTRAINT "CanvasLoginIntents_canvasLTIConfigurationId_fkey" FOREIGN KEY ("canvasLTIConfigurationId") REFERENCES "CanvasLTIConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
