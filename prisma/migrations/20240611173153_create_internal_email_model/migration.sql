-- CreateTable
CREATE TABLE "InternalEmailTemplates" (
    "emailId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "templateKey" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "variables" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "InternalEmailTemplates_emailId_key" ON "InternalEmailTemplates"("emailId");
