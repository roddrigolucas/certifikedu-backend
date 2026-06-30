import { AuditAction } from "@prisma/client";

export interface CreateAuditLogDto {
  action: AuditAction;
  actorId: string;
  pjId?: string;
  targetEntity: string;
  targetId: string;
  description?: string;
  metadata?: Record<string, any>; // The object being deleted
}

