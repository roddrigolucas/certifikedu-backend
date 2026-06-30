import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditAction, MissionStatus, MissionTriggerType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateMissionDto, RankingDto, PlayerDashboardDto } from "./dtos/leveling.dtos";
import { TRankedPlayer } from "./interfaces/leveling.interfaces";
import { AuditService } from "src/audit/audit.service";

@Injectable()
export class LevelingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auditService: AuditService,
  ) { }

  private xpToLevelUp = 500;

  async processEvent(userId: string, type: MissionTriggerType, metada?: { reference?: string, description?: string }) {
    const profile = await this.ensureProfileExists(userId);

    const xpAmount = 10;
    await this.addXp(profile.id, xpAmount, metada?.description || `Atividade realizada: ${xpAmount} XP por evento ${type}`)

    const progressRecords = await this.prismaService.userMissionProgress.findMany({
      where: {
        profileId: profile.id,
        status: MissionStatus.IN_PROGRESS,
        mission: {
          type: type,
          isActive: true,
          OR: [
            { referenceId: null }, // Any certificate
            { referenceId: metada?.reference } // Specific certificate
          ]
        }
      }
    });

    for (const record of progressRecords) {
      const newCount = record.currentCount + 1;
      const mission = await this.prismaService.missionTemplate.findUnique({ where: { id: record.missionId } });
      const isComplete = newCount >= mission.requiredCount;

      await this.prismaService.userMissionProgress.update({
        where: { id: record.id },
        data: {
          currentCount: newCount,
          status: isComplete ? MissionStatus.COMPLETED : MissionStatus.IN_PROGRESS,
        }
      });

      if (isComplete) {
        await this.addXp(profile.id, mission.xpReward, `Missão concluída: ${mission.xpReward} XP por completar a missão ${mission.type}`);
      }
    }
  }

  async getPlayerDashboard(userId: string): Promise<PlayerDashboardDto> {
    const profile = await this.ensureProfileExists(userId);
    const xpMeta = profile.currentLevel * this.xpToLevelUp;

    const missions = await this.prismaService.userMissionProgress.findMany({
      where: { profileId: profile.id },
      include: { mission: true }
    });

    const globalRanking = await this.getGlobalRanking(7);

    return {
      xpAtual: profile.currentXP,
      xpMeta,
      level: profile.currentLevel,
      title: profile.currentTitle,
      missions: missions.map(m => ({
        id: m.mission.id,
        title: m.mission.title,
        status: m.status, // IN_PROGRESS or COMPLETED
        progress: Math.min((m.currentCount / m.mission.requiredCount) * 100, 100),
        category: m.mission.category,
        xpReward: m.mission.xpReward,
        missionDate: m.updatedAt
      })),
      globalRanking: globalRanking
    };
  }

  async getHistory(userId: string) {
    const profile = await this.ensureProfileExists(userId);
    return await this.prismaService.xpHistory.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createMission(dto: CreateMissionDto, schoolId: string, badgeUrl: string, actorId: string) {
    const isActive = dto.isActive === 'active';

    const mission = await this.prismaService.missionTemplate.create({
      data: {
        ...dto,
        school: { connect: { schoolId } },
        isActive,
        badgeUrl
      }
    });

    await this.auditService.log({
      action: AuditAction.CREATE,
      actorId: actorId,
      pjId: schoolId,
      targetEntity: 'Missão (MissionTemplate)',
      targetId: mission.id,
      description: `Criou a missão de gamificação: ${mission.title}`,
      metadata: {
        title: mission.title,
        xpReward: mission.xpReward,
        type: mission.type,
        category: mission.category
      }
    });

    return mission;
  }

  async getMissionsBySchool(schoolId: string, category: 'MISSION' | 'ACHIEVEMENT') {
    return this.prismaService.missionTemplate.findMany({
      where: { schoolId, category },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAchievementsBySchool(schoolId: string) {
    return this.prismaService.missionTemplate.findMany({
      where: { schoolId, category: 'ACHIEVEMENT' },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getMissionDetail(missionId: string, schoolId: string) {
    return this.prismaService.missionTemplate.findFirst({
      where: { id: missionId, schoolId },
      include: {
        _count: {
          select: { userProgress: true } // Stats: How many students started?
        },
        userProgress: {
          select: { status: true }
        }
      }
    });
  }

  async getUserMissionDetail(missionId: string, userId: string) {
    const profile = await this.ensureProfileExists(userId);

    const mission = await this.prismaService.missionTemplate.findUnique({
      where: { id: missionId },
      include: {
        userProgress: {
          where: { profileId: profile.id }, // Filter only THIS user's progress
          take: 1
        }
      }
    });

    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    const progressRecord = mission.userProgress[0];

    const currentCount = progressRecord?.currentCount ?? 0;
    const status = progressRecord?.status ?? 'IN_PROGRESS';

    const progressPercent = mission.requiredCount > 0
      ? Math.min((currentCount / mission.requiredCount) * 100, 100)
      : 0;

    return {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      xpReward: mission.xpReward,
      status: status,
      currentCount: currentCount,
      requiredCount: mission.requiredCount,
      badgeUrl: mission.badgeUrl,

      // Send date only if completed/claimed
      completedAt: (status === 'COMPLETED')
        ? progressRecord?.updatedAt
        : undefined,

      progress: progressPercent,
      type: mission.type,
    };
  }

  async getGlobalRanking(limit: number): Promise<Array<RankingDto>> {
    const profiles = await this.prismaService.gamificationProfile.findMany({
      orderBy: { currentXP: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            pessoaFisica: {
              select: { nome: true }
            },
            pessoaJuridica: {
              select: { razaoSocial: true }
            },
            // Fetch Avatar
            document: {
              where: { status: 'ENABLED' },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { s3Url: true }
            }
          }
        }
      }
    });

    return this.formatRankingResponse(profiles);
  }

  async getRankingBySchool(schoolId: string, limit: number): Promise<Array<RankingDto>> {
    const profiles = await this.prismaService.gamificationProfile.findMany({
      where: {
        user: {
          pessoaFisica: {
            schools: {
              some: { schoolId }
            }
          }
        }
      },
      orderBy: { currentXP: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            pessoaFisica: {
              select: { nome: true }
            },
            document: {
              where: { status: 'ENABLED' },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { s3Url: true }
            }
          }
        }
      }
    });

    return this.formatRankingResponse(profiles);
  }

  async getUserRank(userId: string) {
    const profile = await this.ensureProfileExists(userId);

    const usersAbove = await this.prismaService.gamificationProfile.count({
      where: {
        currentXP: { gt: profile.currentXP }
      }
    });

    const rank = usersAbove + 1;

    return {
      rank,
      xp: profile.currentXP,
      level: profile.currentLevel,
      title: profile.currentTitle,
      userId: userId
    };
  }

  async getUserMissions(userId: string) {
    const profile = await this.ensureProfileExists(userId);

    const progress = await this.prismaService.userMissionProgress.findMany({
      where: {
        profileId: profile.id,
        mission: {
          category: 'MISSION', // Filter: Only Missions
          isActive: true
        }
      },
      include: { mission: true },
      orderBy: { updatedAt: 'desc' }
    });

    return progress.map(p => ({
      mission: {
        id: p.mission.id,
        title: p.mission.title,
        description: p.mission.description,
        xpReward: p.mission.xpReward,
        requiredCount: p.mission.requiredCount,
        badgeUrl: p.mission.badgeUrl
      },
      status: p.status, // 'IN_PROGRESS' | 'COMPLETED'
      currentCount: p.currentCount,
      updatedAt: p.updatedAt
    }));
  }

  async getUserAchievements(userId: string) {
    const profile = await this.ensureProfileExists(userId);

    const progress = await this.prismaService.userMissionProgress.findMany({
      where: {
        profileId: profile.id,
        mission: {
          category: 'ACHIEVEMENT', // Filter: Only Badges
          isActive: true
        }
      },
      include: { mission: true },
      // Show completed first, then by progress
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }]
    });

    return progress.map(p => ({
      mission: {
        id: p.mission.id,
        title: p.mission.title,
        description: p.mission.description,
        xpReward: p.mission.xpReward,
        requiredCount: p.mission.requiredCount,
        badgeUrl: p.mission.badgeUrl
      },
      status: p.status,
      currentCount: p.currentCount,
      updatedAt: p.updatedAt
    }));
  }

  private formatRankingResponse(profiles: TRankedPlayer[]): Array<RankingDto> {
    return profiles.map((p, index) => ({
      rank: index + 1,
      userId: p.user.id,
      name: p.user.pessoaFisica?.nome,
      xp: p.currentXP,
      level: p.currentLevel,
      title: p.currentTitle,

      // Use S3 URL if exists, otherwise default avatar
      imgS3Url: p.user.document?.[0]?.s3Url
    }));
  }

  private async addXp(profileId: string, amount: number, reason: string) {
    // Update log history
    await this.prismaService.xpHistory.create({
      data: { profileId: profileId, xpEarned: amount, actionDescription: reason }
    })

    const profile = await this.prismaService.gamificationProfile.findUnique({ where: { id: profileId } })
    let { currentXP, currentLevel } = profile;

    currentXP += amount;

    // NOTE - Level up every 500xp
    const xpNeeded = currentLevel * this.xpToLevelUp;
    if (currentXP >= xpNeeded) {
      currentLevel += 1;
    }

    const newTitle = this.getTitleForLevel(currentLevel);

    await this.prismaService.gamificationProfile.update({
      where: { id: profileId },
      data: { currentXP, currentLevel, currentTitle: newTitle }
    });
  }

  private async ensureProfileExists(userId: string) {
    // 1. Get or Create Profile
    let profile = await this.prismaService.gamificationProfile.findUnique({
      where: { userId },
      include: { missionProgress: true }
    });

    if (!profile) {
      profile = await this.prismaService.gamificationProfile.create({
        data: { userId },
        include: { missionProgress: true }
      });
    }

    // 2. Fetch Global Missions
    const globalMissions = await this.prismaService.missionTemplate.findMany({
      where: { schoolId: null, isActive: true },
    });

    if (globalMissions.length === 0) return profile;

    // 3. CHECK CERTIFICATES (Corrected for your Schema)
    let userHasCertificates = false;
    const needsCertCheck = globalMissions.some(m => m.type === 'CERTIFICATE_EMISSION');

    if (needsCertCheck) {
      // First, get the PF details to know their CPF and ID
      const pfData = await this.prismaService.pessoaFisica.findUnique({
        where: { userId: userId },
        select: { idPF: true, CPF: true }
      });

      if (pfData) {
        // Query Certificates table looking for this student's ID or Document
        const certCount = await this.prismaService.certificates.count({
          where: {
            OR: [
              { receptorId: pfData.idPF },   // Match by ID
              { receptorDoc: pfData.CPF }    // Match by Document/CPF
            ],
            successStatus: 'SUCCESS' // Only count valid certificates
          }
        });

        userHasCertificates = certCount > 0;
      }
    }

    const newProgressRecords = [];
    const welcomeTitle = 'Bem-vindo a Bordo'; // Must match the Seeder

    for (const mission of globalMissions) {
      const alreadyAssigned = profile.missionProgress.some(mp => mp.missionId === mission.id);

      if (!alreadyAssigned) {
        let initialStatus = 'IN_PROGRESS';
        let initialCount = 0;

        if (mission.title === welcomeTitle) {
          initialStatus = 'COMPLETED';
          initialCount = mission.requiredCount;
        }
        else if (mission.type === MissionTriggerType.CERTIFICATE_EMISSION && userHasCertificates) {
          initialStatus = 'COMPLETED';
          initialCount = mission.requiredCount;
        }

        const newRecord = await this.prismaService.userMissionProgress.create({
          data: {
            profileId: profile.id,
            missionId: mission.id,
            status: initialStatus as any,
            currentCount: initialCount
          }
        });

        newProgressRecords.push(newRecord);

        if (initialStatus === 'COMPLETED') {
          await this.addXp(
            profile.id,
            mission.xpReward,
            `Conquista Inicial: ${mission.title}`
          );
        }
      }
    }

    if (newProgressRecords.length > 0) {
      return this.prismaService.gamificationProfile.findUnique({ where: { id: profile.id } });
    }

    return profile;
  }

  private getTitleForLevel(level: number): string {
    if (level < 5) return 'Iniciante';
    if (level < 10) return 'Aprendiz';
    if (level < 20) return 'Explorador';
    return "Mestre"
  }

  private getStartDate(period: 'weekly' | 'monthly'): Date {
    const now = new Date();
    const startDate = new Date();

    if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {

      startDate.setMonth(now.getMonth() - 1);
    }

    startDate.setHours(0, 0, 0, 0);
    return startDate;
  }


  async getTemporalRanking(period: 'weekly' | 'monthly', limit: number): Promise<Array<RankingDto>> {
    const startDate = this.getStartDate(period);

    const xpAggregations = await this.prismaService.xpHistory.groupBy({
      by: ['profileId'],
      where: {
        createdAt: {
          gte: startDate,
        },

        xpEarned: {
          gt: 0,
        }
      },
      _sum: {
        xpEarned: true,
      },
      orderBy: {
        _sum: {
          xpEarned: 'desc',
        }
      },
      take: limit,
    });

    const profileIds = xpAggregations.map(agg => agg.profileId);

    const rankedProfiles = await this.prismaService.gamificationProfile.findMany({
      where: {
        id: { in: profileIds }
      },
      include: {
        user: {
          select: {
            id: true,
            pessoaFisica: {
              select: { nome: true }
            },
            pessoaJuridica: {
              select: { razaoSocial: true }
            },
            document: {
              where: { status: 'ENABLED' },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { s3Url: true }
            }
          }
        }
      }
    });

    const rankingMap = new Map(xpAggregations.map(agg => [agg.profileId, agg._sum.xpEarned || 0]));

    const sortedRankedProfiles = rankedProfiles
      .sort((a, b) => rankingMap.get(b.id)! - rankingMap.get(a.id)!)
      .map((p) => {

        (p as any).periodXP = rankingMap.get(p.id);
        return p;
      });


    return sortedRankedProfiles.map((p, index) => ({
      rank: index + 1,
      userId: p.user.id,
      name: p.user.pessoaFisica?.nome || p.user.pessoaJuridica?.razaoSocial || 'Usuário Desconhecido',
      xp: (p as any).periodXP as number,
      level: p.currentLevel,
      title: p.currentTitle,

      // Use S3 URL if exists, otherwise default avatar
      imgS3Url: p.user.document?.[0]?.s3Url
    }) as RankingDto);
  }
}