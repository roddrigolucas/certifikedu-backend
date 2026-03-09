-- CreateTable
CREATE TABLE "CanvasLoginIntents" (
    "state" TEXT NOT NULL,
    "canvasLTIConfigurationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CanvasLoginIntents_state_key" ON "CanvasLoginIntents"("state");

-- AddForeignKey
ALTER TABLE "CanvasLoginIntents" ADD CONSTRAINT "CanvasLoginIntents_canvasLTIConfigurationId_fkey" FOREIGN KEY ("canvasLTIConfigurationId") REFERENCES "CanvasLTIConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
