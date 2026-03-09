-- CreateTable
CREATE TABLE "UserImports" (
    "id" SERIAL NOT NULL,
    "importId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pjId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userDocument" TEXT NOT NULL,
    "userName" TEXT,
    "userPhone" TEXT,
    "schoolId" TEXT NOT NULL,
    "courseId" TEXT,
    "errorOnImport" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserImports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserImports" ADD CONSTRAINT "UserImports_pjId_fkey" FOREIGN KEY ("pjId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE CASCADE ON UPDATE CASCADE;
