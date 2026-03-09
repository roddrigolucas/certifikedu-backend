import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  TCourseCreateInput,
  TCourseCreateManyInput,
  TCourseUpdateInput,
  TCourseWithCredentialsOutput,
  TCourseWithSchoolAndStudentsOutput,
  TCourseWithSchoolsOutput,
  TCourseWithTemplatesOutput,
} from './types/courses.types';
import { TSchoolOutput, TSchoolWithCoursesOutput } from 'src/schools/types/schools.types';
import { TUserOutput, TUserPfWithCoursesOutput } from 'src/users/types/user.types';
import { ICreateCourse } from './interfaces/courses.interfaces';

@Injectable()
export class CoursesService {
  constructor(private prismaService: PrismaService) { }

  async getSchool(schoolId: string): Promise<TSchoolOutput> {
    return await this.prismaService.schools.findUnique({
      where: { schoolId: schoolId },
    });
  }

  async getSchoolCourses(schoolId: string): Promise<TSchoolWithCoursesOutput> {
    return await this.prismaService.schools.findUnique({
      where: { schoolId: schoolId },
      include: {
        courses: { include: { course: { include: { curriculum: { select: { name: true, curriculumId: true } } } } } },
      },
    });
  }

  async getCoursesBySchool(schoolId: string): Promise<Array<TCourseWithCredentialsOutput>> {
    return await this.prismaService.course.findMany({
      where: { schools: { every: { schoolId: schoolId } } },
      include: {
        schools: true,
        academicCredentials: true,
        templates: { include: { template: { include: { habilidades: { include: { habilidade: true } } } } } },
        curriculum: { select: { curriculumId: true, name: true } },
      },
    });
  }

  async getCoursesBySchoolsIds(schoolIds: Array<string>): Promise<Array<TCourseWithCredentialsOutput>> {
    return await this.prismaService.course.findMany({
      where: { schools: { every: { schoolId: { in: schoolIds } } } },
      include: {
        schools: true,
        academicCredentials: true,
        templates: { include: { template: { include: { habilidades: { include: { habilidade: true } } } } } },
        curriculum: { select: { curriculumId: true, name: true } },
      },
    });
  }
  async getCourseById(courseId: string): Promise<TCourseWithSchoolsOutput> {
    return await this.prismaService.course.findUnique({
      where: { courseId: courseId },
      include: { schools: { include: { school: true } }, curriculum: { select: { curriculumId: true, name: true } } },
    });
  }

  async getCourseWithCredentialsById(courseId: string): Promise<TCourseWithCredentialsOutput> {
    return await this.prismaService.course.findUnique({
      where: { courseId: courseId },
      include: {
        schools: true,
        academicCredentials: true,
        templates: { include: { template: { include: { habilidades: { include: { habilidade: true } } } } } },
        curriculum: { select: { curriculumId: true, name: true } },
      },
    });
  }

  async createCourse(data: TCourseCreateInput): Promise<TCourseWithCredentialsOutput> {
    return await this.prismaService.course.create({
      data: data,
      include: {
        schools: true,
        academicCredentials: true,
        templates: { include: { template: { include: { habilidades: { include: { habilidade: true } } } } } },
        curriculum: { select: { curriculumId: true, name: true } },
      },
    });
  }

  async editCourse(courseId: string, data: TCourseUpdateInput): Promise<TCourseWithCredentialsOutput> {
    return await this.prismaService.course.update({
      where: { courseId: courseId },
      data: data,
      include: {
        schools: true,
        academicCredentials: true,
        templates: { include: { template: { include: { habilidades: { include: { habilidade: true } } } } } },
        curriculum: { select: { name: true, curriculumId: true } },
      },
    });
  }

  async deleteCourse(courseId: string) {
    await this.prismaService.course.delete({ where: { courseId: courseId } });
  }

  async addCourseCredentials(courseId: string, credentialId: string): Promise<TCourseWithCredentialsOutput> {
    return await this.prismaService.course.update({
      where: { courseId: courseId },
      data: {
        academicCredentials: {
          connect: { credentialId: credentialId },
        },
      },
      include: {
        schools: true,
        academicCredentials: true,
        templates: { include: { template: { include: { habilidades: { include: { habilidade: true } } } } } },
        curriculum: { select: { curriculumId: true, name: true } },
      },
    });
  }

  async getCourseWithStudents(courseId: string): Promise<TCourseWithSchoolAndStudentsOutput> {
    return await this.prismaService.course.findUnique({
      where: { courseId: courseId },
      include: {
        schools: { include: { school: true } },
        students: { include: { student: { include: { user: true } } } },
      },
    });
  }

  async getCourseRawStudents(courseId: string): Promise<Array<TUserOutput>> {
    return await this.prismaService.user.findMany({ where: { tempCourse: courseId } });
  }

  async getCourseWithTemplates(courseId: string): Promise<TCourseWithTemplatesOutput> {
    return await this.prismaService.course.findUnique({
      where: { courseId: courseId },
      include: {
        schools: { include: { school: true } },
        templates: {
          include: {
            template: {
              include: {
                school: true,
                habilidades: { include: { habilidade: true } },
                TemplatesAllowedDocuments: true,
                fontName: true,
                fontDesc: true,
              },
            },
          },
        },
      },
    });
  }

  async findStudents(documentNumbers: Array<string>): Promise<Array<TUserPfWithCoursesOutput>> {
    return await this.prismaService.user.findMany({
      where: { numeroDocumento: { in: documentNumbers } },
      include: { pessoaFisica: { include: { courses: true } } },
    });
  }

  async createCourseStudentAssociation(courseId: string, studentsIds: Array<string>) {
    await this.prismaService.courseStudents.createMany({
      data: studentsIds.map((studentId) => {
        return {
          courseId: courseId,
          idPF: studentId,
        };
      }),
    });
  }

  async deleteCourseStudentAssociation(courseId: string, studentsIds: Array<string>) {
    await this.prismaService.courseStudents.deleteMany({
      where: { AND: [{ courseId: courseId }, { idPF: { in: studentsIds } }] },
    });
  }

  async addStudentToCourse(courseId: string, cpfs: Array<string>) {
    const foundUsers = await this.findStudents(cpfs);

    const users = foundUsers.filter((user) => user?.pessoaFisica);
    const rawUsers = foundUsers.filter((user) => !user?.pessoaFisica);

    const associateUsers = users
      .map((user) => {
        if (!user.pessoaFisica.courses.map((course) => course.courseId).includes(courseId)) {
          return user.pessoaFisica.idPF;
        }
      })
      .filter((id) => id);

    const p = rawUsers.map(async (rawUser) => {
      const schoolInfo = (await this.getCoursesBySchool(rawUser.tempSchool)) ?? null;
      if (rawUser.tempCourse === null && schoolInfo) {
        if (schoolInfo.map((course) => course.courseId).includes(courseId)) {
          await this.prismaService.user.update({
            where: { id: rawUser.id },
            data: { tempCourse: courseId },
          });
        }
      }
    });

    if (associateUsers.length === 0) {
      return null;
    }

    await Promise.all(p);

    await this.createCourseStudentAssociation(courseId, associateUsers);
  }

  async removeStudentFromCourse(courseId: string, cpfs: Array<string>) {
    const foundUsers = await this.findStudents(cpfs);

    const disassociateUsers = foundUsers.map((user) => {
      if (user.pessoaFisica.courses.map((course) => course.courseId).includes(courseId)) {
        return user.pessoaFisica.idPF;
      }
    });

    await this.deleteCourseStudentAssociation(courseId, disassociateUsers);
  }

  async getCreateCourseFromArray(subjectsData: Array<ICreateCourse>) {
    const courses: Array<TCourseCreateManyInput> = (
      await Promise.all(
        subjectsData.map(async (activityInfo) => {
          const { courseId, idPj, level, ...rest } = activityInfo;

          const data: TCourseCreateManyInput = {
            courseId: courseId,
            userId: idPj,
            educationLevel: level,
            ...rest,
          };

          return data;
        }),
      )
    ).filter((x) => x != null);

    await this.prismaService.course.createMany({
      data: courses,
    });
  }

  async getCourseName(courseId: string): Promise<string> {
    const course = await this.prismaService.course.findUnique({
      where: { courseId: courseId },
      select: { name: true },
    });
    return course.name;
  }
}
