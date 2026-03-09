import { Injectable } from '@nestjs/common';
import { TAcademicCredentialsOutput } from '../academic-credentials/types/academic-credentials.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  TSchoolCreateInput,
  TSchoolOutput,
  TSchoolUpdateInput,
  TSchoolWithAllOutput,
  TSchoolWithCoursesOutput,
  TSchoolWithCredentialsOutput,
} from './types/schools.types';

@Injectable()
export class SchoolsService {
  constructor(private readonly prismaService: PrismaService) { }

  async getSchoolByCnpj(cnpj: string): Promise<TSchoolOutput> {
    return await this.prismaService.schools.findUnique({ where: { schoolCnpj: cnpj, isDeleted: false } });
  }

  async getSchoolById(schoolId: string): Promise<TSchoolOutput> {
    return await this.prismaService.schools.findUnique({ where: { schoolId: schoolId, isDeleted: false } });
  }

  async getSchoolWithCredentialsById(schoolId: string): Promise<TSchoolWithCredentialsOutput> {
    return await this.prismaService.schools.findUnique({
      where: { schoolId: schoolId, isDeleted: false },
      include: { academicCredentials: true },
    });
  }

  async getAllUserSchools(idPj: string): Promise<Array<TSchoolWithCoursesOutput>> {
    return await this.prismaService.schools.findMany({
      where: { ownerUserId: idPj, isDeleted: false },
      include: {
        courses: { include: { course: { include: { curriculum: { select: { name: true, curriculumId: true } } } } } },
      },
    });
  }

  async createSchool(data: TSchoolCreateInput): Promise<TSchoolOutput> {
    return await this.prismaService.schools.create({
      data: data,
    });
  }

  async editSchool(schoolId: string, data: TSchoolUpdateInput): Promise<TSchoolOutput> {
    return await this.prismaService.schools.update({
      where: { schoolId: schoolId },
      data: data,
    });
  }

  async deleteSchool(schoolId: string) {
    await this.prismaService.schools.update({
      where: { schoolId: schoolId },
      data: { isDeleted: true },
    });
  }

  async getCredentialsById(credentialId: string): Promise<TAcademicCredentialsOutput> {
    return await this.prismaService.academicCredentials.findUnique({
      where: { credentialId: credentialId },
    });
  }

  async addSchoolsCredentials(schoolId: string, credentialId: string): Promise<TSchoolOutput> {
    return await this.prismaService.schools.update({
      where: { schoolId: schoolId },
      data: {
        academicCredentials: {
          connect: { credentialId: credentialId },
        },
      },
    });
  }

  async getAllUserSchoolsWithAll(idPj: string): Promise<Array<TSchoolWithAllOutput>> {
    return await this.prismaService.schools.findMany({
      where: { ownerUserId: idPj, isDeleted: false },
      include: {
        courses: { include: { course: true } },
        templates: { include: { certificates: true } },
        certificates: true,
      },
    });
  }

  async getSchoolName(schoolId: string): Promise<string> {
    const school = await this.prismaService.schools.findUnique({
      where: { schoolId: schoolId },
      select: { name: true },
    });
    return school.name;
  }
}
