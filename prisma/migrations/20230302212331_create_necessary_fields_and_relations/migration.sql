/*
  Warnings:

  - You are about to drop the column `admin` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numeroDocumento]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,numeroDocumento,email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emissorDoc` to the `certificates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroDocumento` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'ADMIN';

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_emissorId_emissorEmail_fkey";

-- DropIndex
DROP INDEX "users_id_email_key";

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "emissorDoc" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "admin",
ADD COLUMN     "numeroDocumento" TEXT NOT NULL,
ALTER COLUMN "type" DROP DEFAULT,
ALTER COLUMN "status" SET DEFAULT 'REVIEW';

-- CreateTable
CREATE TABLE "PessoaFisica" (
    "idPF" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "CPF" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "dataDeNascimento" TIMESTAMP(3) NOT NULL,
    "cepNumber" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "fotoDocumento" TEXT NOT NULL,

    CONSTRAINT "PessoaFisica_pkey" PRIMARY KEY ("idPF")
);

-- CreateTable
CREATE TABLE "PessoaJuridica" (
    "idPJ" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "CNPJ" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "dataDeFundacao" TIMESTAMP(3),
    "segmento" TEXT,
    "numeroDeFuncionarios" INTEGER,

    CONSTRAINT "PessoaJuridica_pkey" PRIMARY KEY ("idPJ")
);

-- CreateTable
CREATE TABLE "Socios" (
    "sociosId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pessoaJuridicaId" INTEGER NOT NULL,
    "CPF" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "dataDeNascimento" TIMESTAMP(3) NOT NULL,
    "cepNumber" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "fotoDocumento" TEXT NOT NULL,

    CONSTRAINT "Socios_pkey" PRIMARY KEY ("sociosId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PessoaFisica_userId_key" ON "PessoaFisica"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PessoaFisica_CPF_key" ON "PessoaFisica"("CPF");

-- CreateIndex
CREATE UNIQUE INDEX "PessoaFisica_email_key" ON "PessoaFisica"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PessoaFisica_userId_CPF_email_key" ON "PessoaFisica"("userId", "CPF", "email");

-- CreateIndex
CREATE UNIQUE INDEX "PessoaJuridica_userId_key" ON "PessoaJuridica"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PessoaJuridica_CNPJ_key" ON "PessoaJuridica"("CNPJ");

-- CreateIndex
CREATE UNIQUE INDEX "PessoaJuridica_email_key" ON "PessoaJuridica"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PessoaJuridica_userId_CNPJ_email_key" ON "PessoaJuridica"("userId", "CNPJ", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Socios_CPF_key" ON "Socios"("CPF");

-- CreateIndex
CREATE UNIQUE INDEX "users_numeroDocumento_key" ON "users"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_numeroDocumento_email_key" ON "users"("id", "numeroDocumento", "email");

-- AddForeignKey
ALTER TABLE "PessoaFisica" ADD CONSTRAINT "PessoaFisica_userId_CPF_email_fkey" FOREIGN KEY ("userId", "CPF", "email") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PessoaJuridica" ADD CONSTRAINT "PessoaJuridica_userId_CNPJ_email_fkey" FOREIGN KEY ("userId", "CNPJ", "email") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Socios" ADD CONSTRAINT "Socios_pessoaJuridicaId_fkey" FOREIGN KEY ("pessoaJuridicaId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_emissorId_emissorDoc_emissorEmail_fkey" FOREIGN KEY ("emissorId", "emissorDoc", "emissorEmail") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE RESTRICT ON UPDATE CASCADE;
