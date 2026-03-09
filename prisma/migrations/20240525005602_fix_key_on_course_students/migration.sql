/*
  Warnings:

  - You are about to drop the column `userId` on the `CourseStudents` table. All the data in the column will be lost.
  - Added the required column `idPF` to the `CourseStudents` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourseStudents" DROP CONSTRAINT "CourseStudents_courseStudentId_fkey";

-- AlterTable
ALTER TABLE "CourseStudents" DROP COLUMN "userId",
ADD COLUMN     "idPF" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CourseStudents" ADD CONSTRAINT "CourseStudents_idPF_fkey" FOREIGN KEY ("idPF") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;
