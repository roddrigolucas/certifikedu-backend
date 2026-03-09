/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Socios` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pessoaJuridicaId]` on the table `Socios` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Socios_userId_key" ON "Socios"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Socios_pessoaJuridicaId_key" ON "Socios"("pessoaJuridicaId");
