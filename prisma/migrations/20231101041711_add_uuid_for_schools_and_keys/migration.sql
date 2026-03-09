/*
  Warnings:

  - The primary key for the `ApiKeys` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Schools` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "PessoaFisica" DROP CONSTRAINT "PessoaFisica_schoolId_fkey";

-- AlterTable
ALTER TABLE "ApiKeys" DROP CONSTRAINT "ApiKeys_pkey",
ALTER COLUMN "apiKeyId" DROP DEFAULT,
ALTER COLUMN "apiKeyId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ApiKeys_pkey" PRIMARY KEY ("apiKeyId");
DROP SEQUENCE "ApiKeys_apiKeyId_seq";

-- AlterTable
ALTER TABLE "PessoaFisica" ALTER COLUMN "schoolId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Schools" DROP CONSTRAINT "Schools_pkey",
ALTER COLUMN "schoolId" DROP DEFAULT,
ALTER COLUMN "schoolId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Schools_pkey" PRIMARY KEY ("schoolId");
DROP SEQUENCE "Schools_schoolId_seq";

-- AddForeignKey
ALTER TABLE "PessoaFisica" ADD CONSTRAINT "PessoaFisica_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("schoolId") ON DELETE SET NULL ON UPDATE CASCADE;
