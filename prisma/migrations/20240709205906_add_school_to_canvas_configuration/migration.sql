/*
  Warnings:

  - A unique constraint covering the columns `[canvasDomain,canvasClientIdLTI]` on the table `CanvasLTIConfiguration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[canvasConfigId]` on the table `Schools` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Schools" ADD COLUMN     "canvasConfigId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CanvasLTIConfiguration_canvasDomain_canvasClientIdLTI_key" ON "CanvasLTIConfiguration"("canvasDomain", "canvasClientIdLTI");

-- CreateIndex
CREATE UNIQUE INDEX "Schools_canvasConfigId_key" ON "Schools"("canvasConfigId");

-- AddForeignKey
ALTER TABLE "Schools" ADD CONSTRAINT "Schools_canvasConfigId_fkey" FOREIGN KEY ("canvasConfigId") REFERENCES "CanvasLTIConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
