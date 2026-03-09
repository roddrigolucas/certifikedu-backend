import { Injectable } from '@nestjs/common';
import {
  TCertificateSharingOutput,
  TCertificatesWithAbilitiesAndHashAndOpenBadgeOutput,
} from './certificates/types/certificates.types';
import { PrismaService } from './prisma/prisma.service';
import { LearningPathPublicResponseDto } from './learning-paths/dtos/paths-response.dto';
import { TPublicLearningPath } from './learning-paths/types/paths.types';
import { QPublicLearningPaths } from './learning-paths/querys/paths.querys';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCertificateByHash(hash: string): Promise<TCertificateSharingOutput> {
    return await this.prismaService.certificatesSharing.findFirst({
      where: { certificateHash: hash, isValid: true },
    });
  }

  async getCertificateInfoById(certificateId: string): Promise<TCertificatesWithAbilitiesAndHashAndOpenBadgeOutput> {
    return await this.prismaService.certificates.findFirst({
      where: { certificateId: certificateId },
      include: {
        template: { select: { inverseImages: { select: { imageUrl: true } } } },
        habilidades: { include: { habilidade: true } },
        hashes: {
          where: { isValid: true },
        },
        openBadgeModel: true,
        evidence: true,
      },
    });
  }

  async checkCertificateLearningPath(templateId: string): Promise<string> {
    const template = await this.prismaService.templates.findUnique({
      where: { templateId: templateId },
      select: { learningPaths: { select: { pathId: true } } },
    });

    if (template?.learningPaths?.pathId) {
      return template.learningPaths.pathId;
    }

    return null;
  }

  async getLearningPathInformation(pathId: string): Promise<LearningPathPublicResponseDto> {
    const path = await this.prismaService.learningPaths.findUnique({
      where: { pathId: pathId },
      select: QPublicLearningPaths,
    });

    return this.getLearningPathRespose(path);
  }

  async checkUserByEmailAndCpf(email: string, document: string): Promise<{ hasAccount: boolean }> {
    const user = await this.prismaService.user.findFirst({
      where: { OR: [{ email: email }, { numeroDocumento: document }] },
    });

    if (!user) {
      return { hasAccount: false };
    }

    return { hasAccount: true };
  }

  private getLearningPathRespose(path: TPublicLearningPath): LearningPathPublicResponseDto {
    return {
      name: path.name,
      description: path.description,
      createdAt: path.createdAt,
      totalHoursWorkload: path.totalHoursWorkload,
      totalModules: path.modules.length,
      modules: path.modules.map((step) => {
        return {
          moduleId: step.moduleId,
          moduleIndex: step.moduleIndex,
          subjects: step.subjects.map((s) => {
            const i = s.subject;
            return {
              name: i.name,
              description: i.description,
              totalHoursWorkload: i.totalHoursWorkload,
            };
          }),
          activities: step.activities.map((s) => {
            const i = s.activity;
            return {
              name: i.name,
              description: i.description,
              totalHoursWorkload: i.hoursWorkload,
            };
          }),
          internships: step.internships.map((s) => {
            const i = s.internship;
            return {
              name: i.name,
              description: i.description,
              totalHoursWorkload: i.hoursWorkload,
            };
          }),
          events: step.institutionalEvents.map((s) => {
            const i = s.institutionalEvents;
            return {
              name: i.name,
              description: i.description,
              totalHoursWorkload: i.hoursWorkload,
            };
          }),
        };
      }),
    };
  }
}
