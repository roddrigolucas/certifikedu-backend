-- DropForeignKey
ALTER TABLE "Courses" DROP CONSTRAINT "Courses_schoolId_fkey";

-- AddForeignKey
ALTER TABLE "Courses" ADD CONSTRAINT "Courses_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("schoolId") ON DELETE CASCADE ON UPDATE CASCADE;
