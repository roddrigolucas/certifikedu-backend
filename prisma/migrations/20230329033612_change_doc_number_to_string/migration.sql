-- DropForeignKey
ALTER TABLE "PessoaFisica" DROP CONSTRAINT "PessoaFisica_userId_CPF_email_fkey";

-- DropForeignKey
ALTER TABLE "PessoaJuridica" DROP CONSTRAINT "PessoaJuridica_userId_CNPJ_email_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_emissorId_emissorDoc_emissorEmail_fkey";

-- AlterTable
ALTER TABLE "PessoaFisica" ALTER COLUMN "CPF" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PessoaJuridica" ALTER COLUMN "CNPJ" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Socios" ALTER COLUMN "CPF" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "certificates" ALTER COLUMN "receptorDoc" SET DATA TYPE TEXT,
ALTER COLUMN "emissorDoc" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "numeroDocumento" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "PessoaFisica" ADD CONSTRAINT "PessoaFisica_userId_CPF_email_fkey" FOREIGN KEY ("userId", "CPF", "email") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PessoaJuridica" ADD CONSTRAINT "PessoaJuridica_userId_CNPJ_email_fkey" FOREIGN KEY ("userId", "CNPJ", "email") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_emissorId_emissorDoc_emissorEmail_fkey" FOREIGN KEY ("emissorId", "emissorDoc", "emissorEmail") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE CASCADE ON UPDATE CASCADE;
