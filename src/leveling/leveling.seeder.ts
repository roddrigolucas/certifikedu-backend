import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { GamificationCategory, MissionTriggerType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LevelingSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(LevelingSeeder.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await this.seedGlobalMissions();
  }

  private async seedGlobalMissions() {
    this.logger.log('Checking Global Missions...');

    // --- MISSION 1: Certificate Emission (The "Auto-Complete" one) ---
    const certMissionTitle = 'Primeira Conquista';
    const certMission = await this.prisma.missionTemplate.findFirst({
      where: { title: certMissionTitle, schoolId: null }
    });

    if (!certMission) {
      this.logger.log(`Creating Global Mission: ${certMissionTitle}`);
      await this.prisma.missionTemplate.create({
        data: {
          title: certMissionTitle,
          description: 'Emita seu primeiro certificado na plataforma para desbloquear esta conquista.',
          xpReward: 200,
          category: GamificationCategory.MISSION,
          type: MissionTriggerType.CERTIFICATE_EMISSION,
          requiredCount: 1,
          isActive: true,
          schoolId: null, // Global
          badgeUrl: 'https://certifikedu-public.s3.amazonaws.com/badges/global/first-cert.png' // Use a default or placeholder
        }
      });
    }

    // --- MISSION 2: Course Completion (The "Todo" one) ---
    const courseMissionTitle = 'Explorador de Cursos';
    const courseMission = await this.prisma.missionTemplate.findFirst({
      where: { title: courseMissionTitle, schoolId: null }
    });

    if (!courseMission) {
      this.logger.log(`Creating Global Mission: ${courseMissionTitle}`);
      await this.prisma.missionTemplate.create({
        data: {
          title: courseMissionTitle,
          description: 'Complete 3 cursos diferentes para se tornar um explorador.',
          xpReward: 500,
          category: GamificationCategory.MISSION,
          type: MissionTriggerType.COURSE_COMPLETION,
          requiredCount: 3,
          isActive: true,
          schoolId: null,
          badgeUrl: 'https://certifikedu-public.s3.amazonaws.com/badges/global/explorer.png'
        }
      });
    }

    const welcomeMissionTitle = 'Bem-vindo a Bordo';
    const welcomeMission = await this.prisma.missionTemplate.findFirst({
      where: { title: welcomeMissionTitle, schoolId: null }
    });

    if (!welcomeMission) {
      this.logger.log(`Creating Global Mission: ${welcomeMissionTitle}`);
      await this.prisma.missionTemplate.create({
        data: {
          title: welcomeMissionTitle,
          description: 'Parabéns por fazer parte da comunidade CertifikEdu!',
          xpReward: 50, // Recompensa inicial
          category: GamificationCategory.ACHIEVEMENT, // Geralmente é um Achievement/Badge, não uma missão repetível
          type: MissionTriggerType.COURSE_COMPLETION, 
          requiredCount: 1,
          isActive: true,
          schoolId: null,
          badgeUrl: 'https://certifikedu-public.s3.amazonaws.com/badges/global/welcome-badge.png'
        }
      });
    }
  }
}