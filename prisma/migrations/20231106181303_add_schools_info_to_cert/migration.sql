-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "emittedAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "schoolId" TEXT;

-- CreateTable
CREATE TABLE "EvidenceOpenBadge" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "evidenceType" TEXT,
    "evidenceUrl" TEXT,
    "certificateId" INTEGER NOT NULL,

    CONSTRAINT "EvidenceOpenBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NarrativeOpenBadge" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "narrativeDescription" TEXT,
    "narrativeUrl" TEXT,
    "certificateId" INTEGER NOT NULL,

    CONSTRAINT "NarrativeOpenBadge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("schoolId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceOpenBadge" ADD CONSTRAINT "EvidenceOpenBadge_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NarrativeOpenBadge" ADD CONSTRAINT "NarrativeOpenBadge_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE RESTRICT ON UPDATE CASCADE;
