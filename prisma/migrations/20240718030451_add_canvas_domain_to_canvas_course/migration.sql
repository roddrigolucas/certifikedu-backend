/*
  Warnings:

  - A unique constraint covering the columns `[canvasCourseId,canvasDomain]` on the table `CanvasCourse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `canvasDomain` to the `CanvasCourse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CanvasCourse" ADD COLUMN     "canvasDomain" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CanvasCourse_canvasCourseId_canvasDomain_key" ON "CanvasCourse"("canvasCourseId", "canvasDomain");
