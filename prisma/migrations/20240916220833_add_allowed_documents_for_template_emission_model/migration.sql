-- CreateTable
CREATE TABLE "TemplatesAllowedDocuments" (
    "allowId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "templateId" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "hasReceived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TemplatesAllowedDocuments_pkey" PRIMARY KEY ("allowId")
);

-- AddForeignKey
ALTER TABLE "TemplatesAllowedDocuments" ADD CONSTRAINT "TemplatesAllowedDocuments_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Templates"("templateId") ON DELETE RESTRICT ON UPDATE CASCADE;
