/*
  Warnings:

  - You are about to drop the column `idCognito` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_idCognito_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "idCognito";
