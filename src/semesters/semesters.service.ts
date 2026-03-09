import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  TSemesterCreateInput,
  TSemesterUpdateInput,
  TSemesterWhereInput,
  TSemesterWithAllOutput,
  TSemesterWithSubjectsOutput,
} from './types/semesters.types';

@Injectable()
export class SemestersService {
  constructor(private readonly prismaService: PrismaService) {}

  async checkSemester(data: TSemesterWhereInput): Promise<TSemesterWithSubjectsOutput> {
    return await this.prismaService.semester.findFirst({
      where: data,
      include: {
        subjects: { include: { subject: true } },
      },
    });
  }

  async getSemester(semesterId: string): Promise<TSemesterWithAllOutput> {
    return await this.prismaService.semester.findUnique({
      where: { semesterId: semesterId },
      include: {
        subjects: { include: { subject: true } },
        curriculum: { include: { course: { include: { schools: { include: { school: true } } } } } },
      },
    });
  }

  async getCurriculumSemesters(curriculumId: string): Promise<Array<TSemesterWithAllOutput>> {
    return await this.prismaService.semester.findMany({
      where: { curriculumId: curriculumId },
      include: {
        subjects: { include: { subject: true } },
        curriculum: { include: { course: { include: { schools: { include: { school: true } } } } } },
      },
      orderBy: { semesterNumber: 'desc' },
    });
  }

  async createSemester(data: TSemesterCreateInput): Promise<TSemesterWithSubjectsOutput> {
    return await this.prismaService.semester.create({
      data: data,
      include: { subjects: { include: { subject: true } } },
    });
  }

  async editSemester(semesterId: string, data: TSemesterUpdateInput): Promise<TSemesterWithSubjectsOutput> {
    return await this.prismaService.semester.update({
      where: { semesterId: semesterId },
      data: data,
      include: { subjects: { include: { subject: true } } },
    });
  }

  async deleteSemester(semesterId: string) {
    await this.prismaService.semester.delete({ where: { semesterId: semesterId } });
  }

  async validateSubjects(subjectsIds: string[]): Promise<string[]> {
    const subjects = await this.prismaService.subjects.findMany({
      where: { subjectId: { in: subjectsIds }, studyFieldId: null },
      select: { subjectId: true },
    });

    return subjects.map((subject) => {
      return subject.subjectId;
    });
  }

  async addSubjectsToSemester(semesterId: string, subjectsIds: Array<string>): Promise<TSemesterWithSubjectsOutput> {
    return await this.prismaService.semester.update({
      where: { semesterId: semesterId },
      data: {
        subjects: {
          create: subjectsIds.map((id) => {
            return { subjectId: id };
          }),
        },
      },
      include: { subjects: { include: { subject: true } } },
    });
  }

  async removeSubjectsFromSemester(
    semesterId: string,
    subjectsIds: Array<string>,
  ): Promise<TSemesterWithSubjectsOutput> {
    return await this.prismaService.semester.update({
      where: { semesterId: semesterId },
      data: {
        subjects: {
          delete: subjectsIds.map((subjectId) => {
            return { semesterSubjectId: subjectId };
          }),
        },
      },
      include: { subjects: { include: { subject: true } } },
    });
  }
}
