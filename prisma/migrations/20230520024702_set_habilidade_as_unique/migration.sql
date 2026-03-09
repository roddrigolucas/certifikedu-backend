/*
  Warnings:

  - A unique constraint covering the columns `[habilidade]` on the table `Abilities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Abilities_habilidade_key" ON "Abilities"("habilidade");
