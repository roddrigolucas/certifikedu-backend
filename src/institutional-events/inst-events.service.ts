import { Injectable } from '@nestjs/common';
import { EducationLevelEnum } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ICourseToInstEvent } from './interfaces/inst-events.interface';

@Injectable()
export class InstitutionalEventsService {
  constructor(private prismaService: PrismaService) {}

  async getPjEvents(idPj: string): Promise<Array<{ name: string; id: string }>> {
    const events = await this.prismaService.institutionalEvents.findMany({
      where: { userId: idPj },
      select: {
        name: true,
        institutionalEventId: true,
      },
    });

    return events.map((e) => {
      return { name: e.name, id: e.institutionalEventId };
    });
  }

  async checkEventsById(ids: Array<string>): Promise<Array<{institutionalEventId: string, hoursWorkload: number}>> {
    const validEvents = await this.prismaService.institutionalEvents.findMany({
      where: { institutionalEventId: { in: ids } },
      select: { institutionalEventId: true, hoursWorkload: true },
    });

    return validEvents
  }

  async createInstEventByCourse(idPj: string, dto: ICourseToInstEvent) {
    await this.prismaService.institutionalEvents.create({
      data: {
        name: dto.name,
        description: dto.description,
        educationLevel: dto.level,
        hoursWorkload: 0,
        userId: idPj,
      },
    });
  }

  async editInstEventByCourse(idPj: string, old: ICourseToInstEvent, dto: ICourseToInstEvent) {
    const instEvent = await this.prismaService.institutionalEvents.findFirst({
      where: {
        name: old.name,
        description: old.description,
        educationLevel: old.level,
        userId: idPj,
      },
    });

    if (!instEvent) {
      return null;
    }

    await this.prismaService.institutionalEvents.update({
      where: { institutionalEventId: instEvent.institutionalEventId },
      data: {
        name: dto.name,
        description: dto.description,
        educationLevel: dto.level,
        userId: idPj,
      },
    });
  }

  async deleteInstEventByCourse(idPj: string, name: string, description: string, level: EducationLevelEnum) {
    const instEvent = await this.prismaService.institutionalEvents.findFirst({
      where: {
        name: name,
        description: description,
        educationLevel: level,
        userId: idPj,
      },
    });

    if (!instEvent) {
      return null;
    }

    await this.prismaService.institutionalEvents.delete({
      where: { institutionalEventId: instEvent.institutionalEventId },
    });
  }
}
