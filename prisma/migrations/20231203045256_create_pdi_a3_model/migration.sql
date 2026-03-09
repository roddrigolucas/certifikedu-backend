-- CreateTable
CREATE TABLE "PdiA3" (
    "pdiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "pdiVersion" TEXT NOT NULL,
    "answers" TEXT[],
    "response" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "PdiA3_pdiId_key" ON "PdiA3"("pdiId");

-- AddForeignKey
ALTER TABLE "PdiA3" ADD CONSTRAINT "PdiA3_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
