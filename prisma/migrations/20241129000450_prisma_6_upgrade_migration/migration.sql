-- AlterTable
ALTER TABLE "_SchoolsToStudents" ADD CONSTRAINT "_SchoolsToStudents_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_SchoolsToStudents_AB_unique";
