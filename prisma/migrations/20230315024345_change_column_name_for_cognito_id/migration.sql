/*
  Warnings:

  - You are about to drop the column `idCogito` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idCognito]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idCognito` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_idCogito_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "idCogito",
ADD COLUMN     "idCognito" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_idCognito_key" ON "users"("idCognito");
