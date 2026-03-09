import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TStudyFieldAllOutput, TStudyFieldCreateInput, TStudyFieldUpdateInput } from './types/studyfields.types';

@Injectable()
export class StudyFieldsService {
  constructor(private readonly prismaService: PrismaService) {}

  verifyIds(newIds: Array<string>, existingIds: Array<string>): Array<string> {
    const set1 = new Set(existingIds);

    return newIds.filter((element) => set1.has(element));
  }

  async getPjStudyFields(idPj: string): Promise<Array<TStudyFieldAllOutput>> {
    return await this.prismaService.studyField.findMany({
      where: { userId: idPj },
      include: {
        abilities: { include: { abilities: true } },
        subjects: true,
        internships: true,
        activities: true,
      },
    });
  }

  async getStudyFieldById(fieldId: string): Promise<TStudyFieldAllOutput> {
    return await this.prismaService.studyField.findUnique({
      where: { studyFieldId: fieldId },
      include: {
        abilities: { include: { abilities: true } },
        subjects: true,
        internships: true,
        activities: true,
      },
    });
  }

  async createStudyField(data: TStudyFieldCreateInput): Promise<TStudyFieldAllOutput> {
    return await this.prismaService.studyField.create({
      data: data,
      include: {
        abilities: { include: { abilities: true } },
        subjects: true,
        internships: true,
        activities: true,
      },
    });
  }

  async editStudyField(fieldId: string, data: TStudyFieldUpdateInput): Promise<TStudyFieldAllOutput> {
    return await this.prismaService.studyField.update({
      where: { studyFieldId: fieldId },
      data: data,
      include: {
        abilities: { include: { abilities: true } },
        subjects: true,
        internships: true,
        activities: true,
      },
    });
  }

  async deleteStudyField(fieldId: string) {
    await this.prismaService.studyField.delete({
      where: { studyFieldId: fieldId },
    });
  }

  async addActivitiesToField(fieldId: string, activities: Array<string>): Promise<TStudyFieldAllOutput> {
    return await this.prismaService.studyField.update({
      where: { studyFieldId: fieldId },
      data: {
        activities: {
          connect: activities.map((activityId) => {
            return { activityId: activityId };
          }),
        },
      },
      include: {
        abilities: { include: { abilities: true } },
        subjects: true,
        internships: true,
        activities: true,
      },
    });
  }

  async removeActivitiesFromField(fieldId: string, activities: Array<string>): Promise<TStudyFieldAllOutput> {
    return await this.prismaService.studyField.update({
      where: { studyFieldId: fieldId },
      data: {
        activities: {
          disconnect: activities.map((activityId) => {
            return { activityId: activityId };
          }),
        },
      },
      include: {
        abilities: { include: { abilities: true } },
        subjects: true,
        internships: true,
        activities: true,
      },
    });
  }

  async addInternshipsToField(fieldId: string, internships: Array<string>): Promise<TStudyFieldAllOutput> {
    return await this.prismaService.studyField.update({
      where: { studyFieldId: fieldId },
      data: {
        internships: {
          connect: internships.map((internshipId) => {
            return { internshipId: internshipId };
          }),
        },
      },
      include: {
        abilities: { include: { abilities: true } },
        subjects: true,
        internships: true,
        activities: true,
      },
    });
  }

  async removeInternshipsFromField(fieldId: string, internships: Array<string>): Promise<TStudyFieldAllOutput> {
    return await this.prismaService.studyField.update({
      where: { studyFieldId: fieldId },
      data: {
        internships: {
          disconnect: internships.map((internshipId) => {
            return { internshipId: internshipId };
          }),
        },
      },
      include: {
        abilities: { include: { abilities: true } },
        subjects: true,
        internships: true,
        activities: true,
      },
    });
  }

  async addSubjectsToField(fieldId: string, subjects: Array<string>): Promise<TStudyFieldAllOutput> {
    return await this.prismaService.studyField.update({
      where: { studyFieldId: fieldId },
      data: {
        subjects: {
          connect: subjects.map((subjectsId) => {
            return { subjectId: subjectsId };
          }),
        },
      },
      include: {
        abilities: { include: { abilities: true } },
        subjects: true,
        internships: true,
        activities: true,
      },
    });
  }

  async removeSubjectsFromField(fieldId: string, subjects: Array<string>): Promise<TStudyFieldAllOutput> {
    return await this.prismaService.studyField.update({
      where: { studyFieldId: fieldId },
      data: {
        subjects: {
          disconnect: subjects.map((subjectsId) => {
            return { subjectId: subjectsId };
          }),
        },
      },
      include: {
        abilities: { include: { abilities: true } },
        subjects: true,
        internships: true,
        activities: true,
      },
    });
  }

  async addAbilitiesToField(fieldId: string, abilities: Array<string>): Promise<TStudyFieldAllOutput> {
    return await this.prismaService.studyField.update({
      where: { studyFieldId: fieldId },
      data: {
        abilities: {
          create: abilities.map((abilityId) => {
            return { abilityId: abilityId };
          }),
        },
      },
      include: {
        abilities: { include: { abilities: true } },
        subjects: true,
        internships: true,
        activities: true,
      },
    });
  }

  async removeAbilitiesFromField(fieldId: string, abilities: Array<string>): Promise<TStudyFieldAllOutput> {
    return await this.prismaService.studyField.update({
      where: { studyFieldId: fieldId },
      data: {
        abilities: {
          deleteMany: abilities.map((abilityId) => {
            return { abilityId: abilityId };
          }),
        },
      },
      include: {
        abilities: { include: { abilities: true } },
        subjects: true,
        internships: true,
        activities: true,
      },
    });
  }
}
