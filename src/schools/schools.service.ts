import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
import { AuditService } from 'src/audit/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class SchoolsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auditService: AuditService,
  ) { }

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


  async getSchoolContextForUser(userId: string) {
    const ownerSchool = await this.prismaService.schools.findFirst({
      where: {
        userId: { userId: userId },
        isDeleted: false
      },
      select: { schoolId: true, ownerUserId: true }
    });

    if (ownerSchool) return ownerSchool;

    const corporateAdminSchool = await this.prismaService.schools.findFirst({
      where: {
        userId: { // Access the Owner (PessoaJuridica) model
          corporateAdmins: {
            some: {
              pf: {
                user: {
                  id: userId
                }
              },
            }
          }
        },
        isDeleted: false
      },
      select: { schoolId: true, ownerUserId: true }
    });

    if (corporateAdminSchool) return corporateAdminSchool;

    const employeeSchool = await this.prismaService.schools.findFirst({
      where: {
        userId: {
          admins: {
            some: {
              pf: { user: { id: userId } },
              status: 'ENABLED'
            }
          }
        },
        isDeleted: false
      },
      select: { schoolId: true, ownerUserId: true }
    });

    return employeeSchool || null;
  }

  // FIXME: When school cnpj is duplicated the error is not being thrown properly
  async createSchool(data: TSchoolCreateInput, actorId?: string): Promise<TSchoolOutput> {
    const school = await this.prismaService.schools.create({
      data: data,
    });

    // REVIEW - Made it optional to avoid breaking the Canva LTI integration
    if (actorId) {
      await this.auditService.log({
        action: AuditAction.CREATE,
        actorId: actorId,
        pjId: school.ownerUserId, // Assuming the owner matches the PJ context
        targetEntity: 'Schools',
        targetId: school.schoolId,
        description: `Criou a unidade de ensino: ${school.name}`,
        metadata: {
          name: school.name,
          cnpj: school.schoolCnpj,
        }
      });
    }

    return school;
  }

  async createOrReactivateSchool(data: TSchoolCreateInput, actorId?: string): Promise<TSchoolOutput> {
    const existingSchool = await this.prismaService.schools.findUnique({
      where: { schoolCnpj: data.schoolCnpj },
    });

    if (existingSchool) {
      if (!existingSchool.isDeleted) {
        throw new ConflictException('A school with this CNPJ already exists.');
      }

      const reactivatedSchool = await this.prismaService.schools.update({
        where: { schoolId: existingSchool.schoolId },
        data: {
          ...data,
          isDeleted: false,
        },
      });

      // Log the Reactivation
      if (actorId) {
        await this.auditService.log({
          action: AuditAction.UPDATE, // or AuditAction.REACTIVATE if you have it
          actorId: actorId,
          pjId: reactivatedSchool.ownerUserId,
          targetEntity: 'Schools',
          targetId: reactivatedSchool.schoolId,
          description: `Reativou a unidade de ensino: ${reactivatedSchool.name}`,
          metadata: {
            previousStatus: 'Deleted',
            newStatus: 'Active',
            cnpj: reactivatedSchool.schoolCnpj,
          },
        });
      }

      return reactivatedSchool;
    }

    const school = await this.prismaService.schools.create({
      data: data,
    });

    if (actorId) {
      await this.auditService.log({
        action: AuditAction.CREATE,
        actorId: actorId,
        pjId: school.ownerUserId,
        targetEntity: 'Schools',
        targetId: school.schoolId,
        description: `Criou a unidade de ensino: ${school.name}`,
        metadata: {
          name: school.name,
          cnpj: school.schoolCnpj,
        },
      });
    }

    return school;
  }


  async editSchool(schoolId: string, data: TSchoolUpdateInput): Promise<TSchoolOutput> {
    return await this.prismaService.schools.update({
      where: { schoolId: schoolId },
      data: data,
    });
  }

  async deleteSchool(schoolId: string, actorId: string) {
    const school = await this.prismaService.schools.findUnique({
      where: { schoolId: schoolId }
    });

    if (!school) {
      throw new NotFoundException("School not found");
    }

    await this.prismaService.schools.update({
      where: { schoolId: schoolId },
      data: { isDeleted: true },
    });

    await this.auditService.log({
      action: AuditAction.DELETE,
      actorId: actorId,
      pjId: school.ownerUserId,
      targetEntity: 'Schools',
      targetId: schoolId,
      description: `Excluiu a unidade de ensino: ${school.name}`,
      metadata: {
        snapshot: {
          name: school.name,
          cnpj: school.schoolCnpj,
        }
      }
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
