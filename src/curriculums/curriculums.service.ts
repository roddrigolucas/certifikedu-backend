import { Injectable } from '@nestjs/common';
import { TCourseWithSchoolsOutput } from '../courses/types/courses.types';
import { PrismaService } from '../prisma/prisma.service';
import { TCurriculumCreateInput, TCurriculumUpdateInput, TCurriculumWithAllOutput } from './types/curriculum.types';

@Injectable()
export class CurriculumsService {
  constructor(private readonly prismaService: PrismaService) { }

  async getCourse(courseId: string): Promise<TCourseWithSchoolsOutput> {
    return await this.prismaService.course.findUnique({
      where: { courseId: courseId },
      include: { schools: { include: { school: true } }, curriculum: { select: { curriculumId: true, name: true } } },
    });
  }

  async getCourseCurriculums(courseId: string): Promise<Array<TCurriculumWithAllOutput>> {
    return await this.prismaService.curriculum.findMany({
      where: { courseId: courseId },
      include: {
        course: { include: { schools: { include: { school: true } } } },
        activities: { include: { activity: true } },
        internships: { include: { internship: true } },
        semesters: { include: { subjects: { include: { subject: true } } } },
      },
    });
  }

  async getCurriculum(curriculumId: string): Promise<TCurriculumWithAllOutput> {
    return await this.prismaService.curriculum.findUnique({
      where: { curriculumId: curriculumId },
      include: {
        course: { include: { schools: { include: { school: true } } } },
        activities: { include: { activity: true } },
        internships: { include: { internship: true } },
        semesters: { include: { subjects: { include: { subject: true } } } },
      },
    });
  }

  async clearObjectsOnError(data: TCurriculumCreateInput): Promise<TCurriculumWithAllOutput> {
    return await this.prismaService.curriculum.create({
      data: data,
      include: {
        course: { include: { schools: { include: { school: true } } } },
        activities: { include: { activity: true } },
        internships: { include: { internship: true } },
        semesters: { include: { subjects: { include: { subject: true } } } },
      },
    });
  }

  async createCurriculum(data: TCurriculumCreateInput): Promise<TCurriculumWithAllOutput> {
    console.log(JSON.stringify(data))
    console.log(data.semesters.create)
    return await this.prismaService.curriculum.create({
      data: data,
      include: {
        course: { include: { schools: { include: { school: true } } } },
        activities: { include: { activity: true } },
        internships: { include: { internship: true } },
        semesters: { include: { subjects: { include: { subject: true } } } },
      },
    });
  }

  async editCurriculum(curriculumId: string, data: TCurriculumUpdateInput): Promise<TCurriculumWithAllOutput> {
    return await this.prismaService.curriculum.update({
      where: { curriculumId: curriculumId },
      data: data,
      include: {
        course: { include: { schools: { include: { school: true } } } },
        activities: { include: { activity: true } },
        internships: { include: { internship: true } },
        semesters: { include: { subjects: { include: { subject: true } } } },
      },
    });
  }

  async deleteCurriculum(curriculumId: string) {
    await this.prismaService.curriculum.delete({
      where: { curriculumId: curriculumId },
    });
  }

  async addActivitiesToCurriculum(curriculumId: string, activityIds: Array<string>): Promise<TCurriculumWithAllOutput> {
    return await this.prismaService.curriculum.update({
      where: { curriculumId: curriculumId },
      data: {
        activities: {
          create: activityIds.map((id) => {
            return { activityId: id };
          }),
        },
      },
      include: {
        course: { include: { schools: { include: { school: true } } } },
        activities: { include: { activity: true } },
        internships: { include: { internship: true } },
        semesters: { include: { subjects: { include: { subject: true } } } },
      },
    });
  }

  async addInternshipsToCurriculum(
    curriculumId: string,
    internshipsIds: Array<string>,
  ): Promise<TCurriculumWithAllOutput> {
    return await this.prismaService.curriculum.update({
      where: { curriculumId: curriculumId },
      data: {
        internships: {
          create: internshipsIds.map((id) => {
            return { internshipId: id };
          }),
        },
      },
      include: {
        course: { include: { schools: { include: { school: true } } } },
        activities: { include: { activity: true } },
        internships: { include: { internship: true } },
        semesters: { include: { subjects: { include: { subject: true } } } },
      },
    });
  }

  async removeActivitiesFromCurriculum(
    curriculumId: string,
    activitiyIds: Array<string>,
  ): Promise<TCurriculumWithAllOutput> {
    return await this.prismaService.curriculum.update({
      where: { curriculumId: curriculumId },
      data: {
        activities: {
          deleteMany: activitiyIds.map((id) => {
            return { activityId: id };
          }),
        },
      },
      include: {
        course: { include: { schools: { include: { school: true } } } },
        activities: { include: { activity: true } },
        internships: { include: { internship: true } },
        semesters: { include: { subjects: { include: { subject: true } } } },
      },
    });
  }

  async removeInternshipsFromCurriculum(
    curriculumId: string,
    internshipsIds: Array<string>,
  ): Promise<TCurriculumWithAllOutput> {
    return await this.prismaService.curriculum.update({
      where: { curriculumId: curriculumId },
      data: {
        internships: {
          deleteMany: internshipsIds.map((id) => {
            return { internshipId: id };
          }),
        },
      },
      include: {
        course: { include: { schools: { include: { school: true } } } },
        activities: { include: { activity: true } },
        internships: { include: { internship: true } },
        semesters: { include: { subjects: { include: { subject: true } } } },
      },
    });
  }
}
