/*
  Warnings:

  - You are about to drop the column `schoolId` on the `PessoaFisica` table. All the data in the column will be lost.
  - Added the required column `studentsId` to the `Schools` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PessoaFisica" DROP CONSTRAINT "PessoaFisica_schoolId_fkey";

-- AlterTable
ALTER TABLE "PessoaFisica" DROP COLUMN "schoolId";

-- AlterTable
ALTER TABLE "Schools" ADD COLUMN     "studentsId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Schools" ADD CONSTRAINT "Schools_studentsId_fkey" FOREIGN KEY ("studentsId") REFERENCES "PessoaFisica"("idPF") ON DELETE RESTRICT ON UPDATE CASCADE;
