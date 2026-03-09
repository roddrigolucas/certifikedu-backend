/*
  Warnings:

  - You are about to drop the column `studentsId` on the `Schools` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Schools" DROP CONSTRAINT "Schools_studentsId_fkey";

-- AlterTable
ALTER TABLE "Schools" DROP COLUMN "studentsId";

-- CreateTable
CREATE TABLE "_SchoolsToStudents" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SchoolsToStudents_AB_unique" ON "_SchoolsToStudents"("A", "B");

-- CreateIndex
CREATE INDEX "_SchoolsToStudents_B_index" ON "_SchoolsToStudents"("B");

-- AddForeignKey
ALTER TABLE "_SchoolsToStudents" ADD CONSTRAINT "_SchoolsToStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchoolsToStudents" ADD CONSTRAINT "_SchoolsToStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "Schools"("schoolId") ON DELETE CASCADE ON UPDATE CASCADE;
