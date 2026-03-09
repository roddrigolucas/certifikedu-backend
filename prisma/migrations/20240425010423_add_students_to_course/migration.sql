-- CreateTable
CREATE TABLE "CourseStudents" (
    "courseStudentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "CourseStudents_pkey" PRIMARY KEY ("courseStudentId")
);

-- AddForeignKey
ALTER TABLE "CourseStudents" ADD CONSTRAINT "CourseStudents_courseStudentId_fkey" FOREIGN KEY ("courseStudentId") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseStudents" ADD CONSTRAINT "CourseStudents_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;
