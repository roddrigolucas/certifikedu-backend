/*
  Warnings:

  - You are about to drop the `Certificates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Certificates";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "type" "UserType" NOT NULL DEFAULT 'PF',
    "status" "UserStatus" NOT NULL DEFAULT 'ENABLED',
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "receptorId" INTEGER,
    "receptorName" TEXT,
    "name" TEXT,
    "cargaHoraria" INTEGER,
    "habilidades" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "emissorId" INTEGER NOT NULL,
    "emissorEmail" TEXT NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_email_key" ON "users"("id", "email");

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_emissorId_emissorEmail_fkey" FOREIGN KEY ("emissorId", "emissorEmail") REFERENCES "users"("id", "email") ON DELETE RESTRICT ON UPDATE CASCADE;
