/*
  Warnings:

  - Added the required column `userId` to the `AcademicCredentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AcademicCredentials" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AcademicCredentials" ADD CONSTRAINT "AcademicCredentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;
