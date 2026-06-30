import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateAuditLogDto } from "./dtos/audit.dtos";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) { }

  async log(data: CreateAuditLogDto) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: data.action,
          actorId: data.actorId, 
          pjId: data.pjId,       
          targetEntity: data.targetEntity,
          targetId: data.targetId,
          description: data.description,
          metadata: data.metadata as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log', error);
    }
  }

  // Admin / Global View
  async getAllLogs() {
    const logs = await this.prisma.auditLog.findMany({
      include: {
        actor: {
          select: {
            email: true,
            type: true,
            // Safe selection: pessoaFisica might be null if actor is a School Account
            pessoaFisica: { select: { email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return logs.map((log) => {
      // Logic: Prefer the Person's contact email -> Fallback to User Login email
      const preferredEmail = log.actor.pessoaFisica?.email ?? log.actor.email;

      return {
        ...log,
        actor: {
          type: log.actor.type,
          email: preferredEmail,
        }
      };
    });
  }

  // School View
  async getLogsByPjId(pjId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        pjId: pjId,
      },
      include: {
        actor: {
          select: {
            id: true,
            type: true,
            email: true, // Fallback (Login Email)

            // 1. Fetch Human Profile
            pessoaFisica: {
              select: {
                nome: true,
                email: true, // Preferred (Contact Email)

                pjAdmin: {
                  where: { idPJ: pjId },
                  select: { role: true, status: true }
                },
                corporateAdmins: {
                  where: { idPJ: pjId },
                  select: { role: true }
                }
              }
            },

            // 3. Fetch PJ Profile (Fallback if the actor is the School Owner itself)
            pessoaJuridica: {
              select: { nomeFantasia: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return logs.map((log) => {
      const pf = log.actor.pessoaFisica;
      const pj = log.actor.pessoaJuridica;

      // Determine the specific role record for this context
      const activeAdmin = pf?.pjAdmin?.[0] || pf?.corporateAdmins?.[0];

      // Determine Display Name
      let displayName = 'Usuário Desconhecido';
      if (pf) {
        displayName = pf.nome;
      } else if (pj) {
        displayName = pj.nomeFantasia || 'Conta da Escola (Dono)';
      }

      // Determine Display Email
      const displayEmail = pf?.email ?? log.actor.email;

      return {
        id: log.id,
        action: log.action,
        description: log.description,
        createdAt: log.createdAt,
        targetEntity: log.targetEntity,
        targetId: log.targetId,
        metadata: log.metadata,

        actor: {
          userId: log.actor.id,
          name: displayName,
          email: displayEmail,
          type: log.actor.type,

          // Contextual Role Info
          isAdmin: !!activeAdmin || log.actor.type === 'PJ',
          role: activeAdmin?.role || (log.actor.type === 'PJ' ? 'OWNER' : null),
        }
      };
    });
  }
}