-- AlterTable
ALTER TABLE "PessoaFisica" ADD COLUMN     "schoolId" INTEGER;

-- CreateTable
CREATE TABLE "Schools" (
    "schoolId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolCnpj" TEXT NOT NULL,
    "homepageUrl" TEXT,
    "phoneNumber" TEXT,
    "description" TEXT,
    "logoImage" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerUserId" INTEGER NOT NULL,

    CONSTRAINT "Schools_pkey" PRIMARY KEY ("schoolId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Schools_schoolCnpj_key" ON "Schools"("schoolCnpj");

-- AddForeignKey
ALTER TABLE "PessoaFisica" ADD CONSTRAINT "PessoaFisica_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("schoolId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schools" ADD CONSTRAINT "Schools_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;
