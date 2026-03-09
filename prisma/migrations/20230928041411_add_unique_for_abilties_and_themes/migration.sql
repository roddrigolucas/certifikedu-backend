/*
  Warnings:

  - A unique constraint covering the columns `[habilidade,tema]` on the table `Abilities` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Abilities_habilidade_key";

-- CreateIndex
CREATE UNIQUE INDEX "Abilities_habilidade_tema_key" ON "Abilities"("habilidade", "tema");
