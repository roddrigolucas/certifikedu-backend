-- AlterEnum
ALTER TYPE "EducationLevelEnum" ADD VALUE 'Canvas';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "canvasCourseId" INTEGER;

-- CreateTable
CREATE TABLE "CanvasLTIConfiguration" (
    "id" TEXT NOT NULL,
    "idPJ" TEXT NOT NULL,
    "canvasDomain" TEXT NOT NULL,
    "canvasClientIdLTI" TEXT NOT NULL,
    "canvasClientIdDevKey" TEXT NOT NULL,
    "canvasClientSecretDevKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanvasLTIConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasUser" (
    "id" TEXT NOT NULL,
    "idPF" TEXT NOT NULL,
    "canvasUserId" INTEGER NOT NULL,
    "canvasEmail" TEXT NOT NULL,
    "canvasName" TEXT NOT NULL,
    "canvasDomain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanvasUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasToken" (
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tokenExp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "CanvasCourse" (
    "id" TEXT NOT NULL,
    "canvasCourseId" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "canvasName" TEXT NOT NULL,
    "canvasDescription" TEXT NOT NULL,
    "canvasStartDate" TIMESTAMP(3) NOT NULL,
    "canvasEndDate" TIMESTAMP(3) NOT NULL,
    "canvasTotalStudents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanvasCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CanvasLTIConfiguration_idPJ_key" ON "CanvasLTIConfiguration"("idPJ");

-- CreateIndex
CREATE UNIQUE INDEX "CanvasUser_idPF_key" ON "CanvasUser"("idPF");

-- CreateIndex
CREATE UNIQUE INDEX "CanvasUser_canvasEmail_key" ON "CanvasUser"("canvasEmail");

-- CreateIndex
CREATE UNIQUE INDEX "CanvasToken_email_key" ON "CanvasToken"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CanvasCourse_courseId_key" ON "CanvasCourse"("courseId");

-- AddForeignKey
ALTER TABLE "CanvasLTIConfiguration" ADD CONSTRAINT "CanvasLTIConfiguration_idPJ_fkey" FOREIGN KEY ("idPJ") REFERENCES "PessoaJuridica"("idPJ") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasUser" ADD CONSTRAINT "CanvasUser_idPF_fkey" FOREIGN KEY ("idPF") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasCourse" ADD CONSTRAINT "CanvasCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;
