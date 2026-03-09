import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICreateSubject } from './interfaces/subjects.interfaces';
import {
  TSubjectCreateInput,
  TSubjectCreateManyInput,
  TSubjectUpdateInput,
  TSubjectWhereInput,
  TSubjectWithSemesterOutput,
} from './types/subjects.types';

@Injectable()
export class SubjectsService {
  constructor(private readonly prismaService: PrismaService) { }

  async checkSubjectsByIds(ids: Array<string>): Promise<Array<{subjectId: string, totalHoursWorkload: number}>> {
      const activitiesIds = await this.prismaService.subjects.findMany({
        where: { subjectId: {in: ids} },
        select: {subjectId: true, totalHoursWorkload: true},
      });

      return activitiesIds
    }

  async checkSubject(data: TSubjectWhereInput): Promise<TSubjectWithSemesterOutput> {
    return await this.prismaService.subjects.findFirst({
      where: data,
      include: {
        semesters: true,
        studyFields: true,
      },
    });
  }

  async getUserSubjects(idPj: string): Promise<Array<TSubjectWithSemesterOutput>> {
    return await this.prismaService.subjects.findMany({
      where: { userId: idPj },
      include: { semesters: true, studyFields: true },
    });
  }

  async createSubject(data: TSubjectCreateInput): Promise<TSubjectWithSemesterOutput> {
    return await this.prismaService.subjects.create({
      data: data,
      include: { semesters: true, studyFields: true },
    });
  }

  async getSubjectById(subjectId: string): Promise<TSubjectWithSemesterOutput> {
    return await this.prismaService.subjects.findUnique({
      where: { subjectId: subjectId },
      include: { semesters: true, studyFields: true },
    });
  }

  async editSubject(subjectId: string, data: TSubjectUpdateInput): Promise<TSubjectWithSemesterOutput> {
    return await this.prismaService.subjects.update({
      where: { subjectId: subjectId },
      data: data,
      include: { semesters: true, studyFields: true },
    });
  }

  async deleteSubject(subjectId: string) {
    await this.prismaService.subjects.delete({
      where: { subjectId: subjectId },
    });
  }

  async addSubjectToSemesters(subjectId: string, semestersIds: Array<string>): Promise<TSubjectWithSemesterOutput> {
    await this.prismaService.semesterSubjects.createMany({
      data: semestersIds.map((semesterId) => {
        return { semesterId: semesterId, subjectId: subjectId };
      }),
    });

    return this.getSubjectById(subjectId);
  }

  async removeSubjectFromSemesters(
    subjectId: string,
    semestersIds: Array<string>,
  ): Promise<TSubjectWithSemesterOutput> {
    await this.prismaService.semesterSubjects.deleteMany({
      where: { AND: [{ subjectId: subjectId }, { semesterId: { in: semestersIds } }] },
    });

    return this.getSubjectById(subjectId);
  }

  async getCreateSubjectsFromArray(subjectsData: Array<ICreateSubject>) {
    const subjects: Array<TSubjectCreateManyInput> = (
      await Promise.all(
        subjectsData.map(async (activityInfo) => {
          const { subjectId, idPj, ...rest } = activityInfo;

          const subjectData = await this.checkSubject({
            ...rest
          });

          if (subjectData) {
            return null;
          }

          const data: TSubjectCreateManyInput = {
            userId: idPj,
            ...rest,
          };

          return data;
        }),
      )
    ).filter((x) => x != null);

    return subjects
    // await this.prismaService.subjects.createMany({
    //   data: subjects,
    // });
  }
}
