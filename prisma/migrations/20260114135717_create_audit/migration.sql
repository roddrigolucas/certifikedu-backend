-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT_REPORT', 'APPROVE_CERTIFICATE');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "AuditAction" NOT NULL,
    "description" TEXT,
    "actorId" TEXT NOT NULL,
    "pjId" TEXT,
    "targetEntity" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_pjId_idx" ON "audit_logs"("pjId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_pjId_fkey" FOREIGN KEY ("pjId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE CASCADE ON UPDATE CASCADE;