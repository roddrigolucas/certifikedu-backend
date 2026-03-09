/*
  Warnings:

  - A unique constraint covering the columns `[idCogito]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `CPF` on the `PessoaFisica` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `CNPJ` on the `PessoaJuridica` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `CPF` on the `Socios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `receptorDoc` to the `certificates` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `emissorDoc` on the `certificates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `idCogito` to the `users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `numeroDocumento` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "PessoaFisica" DROP CONSTRAINT "PessoaFisica_userId_CPF_email_fkey";

-- DropForeignKey
ALTER TABLE "PessoaJuridica" DROP CONSTRAINT "PessoaJuridica_userId_CNPJ_email_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_emissorId_emissorDoc_emissorEmail_fkey";

-- AlterTable
ALTER TABLE "PessoaFisica" DROP COLUMN "CPF",
ADD COLUMN     "CPF" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PessoaJuridica" DROP COLUMN "CNPJ",
ADD COLUMN     "CNPJ" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Socios" DROP COLUMN "CPF",
ADD COLUMN     "CPF" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "receptorDoc" INTEGER NOT NULL,
DROP COLUMN "emissorDoc",
ADD COLUMN     "emissorDoc" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "idCogito" TEXT NOT NULL,
DROP COLUMN "numeroDocumento",
ADD COLUMN     "numeroDocumento" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PessoaFisica_CPF_key" ON "PessoaFisica"("CPF");

-- CreateIndex
CREATE UNIQUE INDEX "PessoaFisica_userId_CPF_email_key" ON "PessoaFisica"("userId", "CPF", "email");

-- CreateIndex
CREATE UNIQUE INDEX "PessoaJuridica_CNPJ_key" ON "PessoaJuridica"("CNPJ");

-- CreateIndex
CREATE UNIQUE INDEX "PessoaJuridica_userId_CNPJ_email_key" ON "PessoaJuridica"("userId", "CNPJ", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Socios_CPF_key" ON "Socios"("CPF");

-- CreateIndex
CREATE UNIQUE INDEX "users_idCogito_key" ON "users"("idCogito");

-- CreateIndex
CREATE UNIQUE INDEX "users_numeroDocumento_key" ON "users"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_numeroDocumento_email_key" ON "users"("id", "numeroDocumento", "email");

-- AddForeignKey
ALTER TABLE "PessoaFisica" ADD CONSTRAINT "PessoaFisica_userId_CPF_email_fkey" FOREIGN KEY ("userId", "CPF", "email") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PessoaJuridica" ADD CONSTRAINT "PessoaJuridica_userId_CNPJ_email_fkey" FOREIGN KEY ("userId", "CNPJ", "email") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_emissorId_emissorDoc_emissorEmail_fkey" FOREIGN KEY ("emissorId", "emissorDoc", "emissorEmail") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE RESTRICT ON UPDATE CASCADE;
