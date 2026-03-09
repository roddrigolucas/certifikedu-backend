-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "certificateLogo" TEXT,
ADD COLUMN     "courseId" TEXT;

-- CreateTable
CREATE TABLE "Courses" (
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logoImage" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,
    "certificatePicture" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "Courses_pkey" PRIMARY KEY ("courseId")
);

-- CreateTable
CREATE TABLE "CourseAbilities" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "habilidadeId" TEXT NOT NULL,

    CONSTRAINT "CourseAbilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseAbilities_courseId_habilidadeId_key" ON "CourseAbilities"("courseId", "habilidadeId");

-- AddForeignKey
ALTER TABLE "Courses" ADD CONSTRAINT "Courses_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("schoolId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAbilities" ADD CONSTRAINT "CourseAbilities_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAbilities" ADD CONSTRAINT "CourseAbilities_habilidadeId_fkey" FOREIGN KEY ("habilidadeId") REFERENCES "Abilities"("habilidadeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("courseId") ON DELETE SET NULL ON UPDATE CASCADE;
