-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('PF', 'PJ');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ENABLED', 'DISABLED', 'REVIEW');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "type" "UserType" NOT NULL DEFAULT 'PF',
    "status" "UserStatus" NOT NULL DEFAULT 'ENABLED',
    "admin" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificates" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "receptorId" INTEGER,
    "receptorName" TEXT,
    "name" TEXT,
    "cargaHoraria" INTEGER,
    "habilidades" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Certificates_pkey" PRIMARY KEY ("id")
);
