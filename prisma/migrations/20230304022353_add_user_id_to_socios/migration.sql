/*
  Warnings:

  - A unique constraint covering the columns `[userId,idPJ]` on the table `PessoaJuridica` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Socios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PessoaFisica" DROP CONSTRAINT "PessoaFisica_userId_CPF_email_fkey";

-- DropForeignKey
ALTER TABLE "PessoaJuridica" DROP CONSTRAINT "PessoaJuridica_userId_CNPJ_email_fkey";

-- DropForeignKey
ALTER TABLE "Socios" DROP CONSTRAINT "Socios_pessoaJuridicaId_fkey";

-- AlterTable
ALTER TABLE "Socios" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PessoaJuridica_userId_idPJ_key" ON "PessoaJuridica"("userId", "idPJ");

-- AddForeignKey
ALTER TABLE "PessoaFisica" ADD CONSTRAINT "PessoaFisica_userId_CPF_email_fkey" FOREIGN KEY ("userId", "CPF", "email") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PessoaJuridica" ADD CONSTRAINT "PessoaJuridica_userId_CNPJ_email_fkey" FOREIGN KEY ("userId", "CNPJ", "email") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Socios" ADD CONSTRAINT "Socios_userId_pessoaJuridicaId_fkey" FOREIGN KEY ("userId", "pessoaJuridicaId") REFERENCES "PessoaJuridica"("userId", "idPJ") ON DELETE CASCADE ON UPDATE CASCADE;
