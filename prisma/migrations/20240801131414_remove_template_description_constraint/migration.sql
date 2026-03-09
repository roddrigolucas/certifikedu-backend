-- AlterTable
ALTER TABLE "Templates" ALTER COLUMN "descriptionImage" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "MigrationTest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MigrationTest_pkey" PRIMARY KEY ("id")
);
