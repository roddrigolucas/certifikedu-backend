import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TCreateLearningPathInput, TLearningPath, TUpdateLearningPathInput } from './types/paths.types';
import { QLearningPaths } from './querys/paths.querys';
import { IPathModules } from './interfaces/paths.interfaces';
import { InstitutionalEventsService } from '../institutional-events/inst-events.service';
import { ActivitiesService } from '../activities/activities.service';
import { InternshipsService } from '../internships/internships.service';
import { SubjectsService } from '../subjects/subjects.service';

@Injectable()
export class LearningPathService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventsService: InstitutionalEventsService,
    private readonly activitiesService: ActivitiesService,
    private readonly internshipsService: InternshipsService,
    private readonly subjectsService: SubjectsService,
  ) {}

  async getPjLearningPaths(idPj: string): Promise<Array<TLearningPath>> {
    return await this.prismaService.learningPaths.findMany({
      where: { pjId: idPj },
      select: QLearningPaths,
    });
  }

  async checkLearningPathById(pathId: string): Promise<boolean> {
    const path = await this.prismaService.learningPaths.findUnique({
      where: { pathId: pathId },
      select: { pathId: true },
    });

    if (path?.pathId) {
      return true;
    }

    return false;
  }

  async getLearningPathById(pathId: string): Promise<TLearningPath> {
    return await this.prismaService.learningPaths.findUnique({
      where: { pathId: pathId },
      select: QLearningPaths,
    });
  }

  async updateLearningPath(pathId: string, data: TUpdateLearningPathInput): Promise<string> {
    return (
      await this.prismaService.learningPaths.update({
        where: { pathId: pathId },
        data: data,
        select: { pathId: true },
      })
    ).pathId;
  }

  async createLearningPath(data: TCreateLearningPathInput): Promise<TLearningPath> {
    return await this.prismaService.learningPaths.create({
      data: data,
      select: QLearningPaths,
    });
  }

  async deleteLearningPath(pathId: string) {
    await this.prismaService.learningPaths.delete({
      where: { pathId: pathId },
    });
  }

  async deleteLearningPathModules(pathId: string) {
    await this.prismaService.learningPathsModules.deleteMany({
      where: { pathId: pathId },
    });
  }

  async associateModuleChildren(pathId: string, modules: Array<IPathModules>): Promise<string> {
    const cargaHoraria = [];
    const querys = [];
    const p = modules.map(async (module) => {
      const moduleId = (
        await this.prismaService.learningPathsModules.findFirst({
          where: { moduleIndex: module.index, pathId: pathId },
          select: { moduleId: true },
        })
      ).moduleId;

      if (module.events) {
        const validEvents = await this.eventsService.checkEventsById(module.events.map((i) => i.id));
        cargaHoraria.push(...validEvents.map((e) => e.hoursWorkload));
        if (validEvents.length > 0) {
          const query = this.prismaService.learningPathsModules.update({
            where: { moduleId },
            data: {
              institutionalEvents: {
                createMany: {
                  data: validEvents.map((e) => {
                    return { institutionalEventsId: e.institutionalEventId };
                  }),
                },
              },
            },
          });
          querys.push(query);
        }
      }

      if (module.internships) {
        const validEvents = await this.internshipsService.checkInternshipsByIds(module.internships.map((i) => i.id));
        cargaHoraria.push(...validEvents.map((e) => e.hoursWorkload));
        if (validEvents.length > 0) {
          const query = this.prismaService.learningPathsModules.update({
            where: { moduleId },
            data: {
              internships: {
                createMany: {
                  data: validEvents.map((e) => {
                    return { internshipId: e.internshipId };
                  }),
                },
              },
            },
          });
          querys.push(query);
        }
      }

      if (module.activities) {
        const validEvents = await this.activitiesService.checkActivitiesByIds(module.activities.map((i) => i.id));
        cargaHoraria.push(...validEvents.map((e) => e.hoursWorkload));
        if (validEvents.length > 0) {
          const query = this.prismaService.learningPathsModules.update({
            where: { moduleId },
            data: {
              activities: {
                createMany: {
                  data: validEvents.map((e) => {
                    return { activityId: e.activityId };
                  }),
                },
              },
            },
          });
          querys.push(query);
        }
      }

      if (module.subjects) {
        const validEvents = await this.subjectsService.checkSubjectsByIds(module.subjects.map((i) => i.id));
        if (validEvents.length > 0) {
          cargaHoraria.push(...validEvents.map((e) => e.totalHoursWorkload));
          const query = this.prismaService.learningPathsModules.update({
            where: { moduleId },
            data: {
              subjects: {
                createMany: {
                  data: validEvents.map((e) => {
                    return { subjectId: e.subjectId };
                  }),
                },
              },
            },
          });
          querys.push(query);
        }
      }
    });

    await Promise.all(p);

    const totalHoursWorkload = cargaHoraria.reduce((a, b) => a + b, 0);
    const hoursQuery = this.prismaService.learningPaths.update({
      where: { pathId: pathId },
      data: {
        totalHoursWorkload: totalHoursWorkload,
      },
    });

    querys.push(hoursQuery);

    await this.prismaService.$transaction(querys);

    return pathId;
  }

  async associatePfOnEmission(idPf: string, templateId: string) {
    const paths = await this.prismaService.learningPaths.findMany({
      where: { templateId: templateId },
      select: { pathId: true },
    });

    const querys = [];
    paths.map((path) => {
      const query = this.prismaService.learningPathsStudents.create({
        data: {
          idPf: idPf,
          completed: true,
          completedAt: new Date(),
          pathId: path.pathId,
        },
      });

      querys.push(query);
    });

    await this.prismaService.$transaction(querys);
  }
}
