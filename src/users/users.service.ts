import { Injectable } from '@nestjs/common';
import { CertificateStatus, Prisma, UserStatus, UserType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';
import {
  TDocumentPictureCreateInput,
  TDocumentPictureOutput,
  TPessoaFisicaCreateInput,
  TPessoaFisicaUpdateInput,
  TPessoaJuridicaUpdateInput,
  TUserOnCourseOutput,
  TUserOnSchoolsOutput,
  TUserOutput,
  TUserPfAndPjAndDocumentOutput,
  TUserPfAndPjAndPartnersOutput,
  TUserPfOutput,
  TUserPfWithBasicInfoOutput,
  TUserPfWithSchoolsOutput,
  TUserWithPfAndProfileOutput,
  TUserWithPjAndLtiAndKeysOutput,
} from './types/user.types';
import { TPessoaFisicaOutput } from '../_aux/types/_aux.types';
import {
  TCorporateAdminsWithPfOutput,
  TCorporateAdminsWithPjOutput,
  TPessoaJuridicaWithSociosOutput,
  TPjAdminsWithPfOutput,
  TPjAdminsWithPjOutput,
} from '../pjusers/types/pjusers.types';
import { IUserCompanies } from '../pjusers/interfaces/pjusers.interfaces';
import { EnvironmentEnum } from '../pjusers/dtos/pjusers-input.dto';
import { IResponseUsersRawInfo } from '../auth/interfaces/auth.interfaces';
import { UserImportsListDto } from '../pjinfo/dtos/students/students-input.dto';
import { CoursesService } from '../courses/courses.service';
import { SchoolsService } from '../schools/schools.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly schoolsService: SchoolsService,
    private readonly coursesService: CoursesService,
  ) {}

  async getUserById(userId: string): Promise<TUserOutput> {
    return await this.prismaService.user.findUnique({
      where: { id: userId },
    });
  }

  async getUserByEmail(email: string): Promise<TUserOutput> {
    return await this.prismaService.user.findUnique({
      where: { email: email },
    });
  }

  async getUserByPfId(idPf: string): Promise<TUserPfOutput> {
    return await this.prismaService.user.findFirst({
      where: { pessoaFisica: { idPF: idPf } },
      include: { pessoaFisica: true },
    });
  }

  async getPfUserByDocument(userDocument: string): Promise<TUserPfOutput> {
    return await this.prismaService.user.findUnique({
      where: { numeroDocumento: userDocument },
      include: { pessoaFisica: true },
    });
  }

  async checkIsRawUserById(userId: string): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { pessoaFisica: true },
    });

    if (user.type === UserType.PF && !user?.pessoaFisica) {
      return true;
    }

    return false;
  }

  async getPessoaFisicaByUserId(userId: string): Promise<TUserWithPfAndProfileOutput> {
    return await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        pessoaFisica: {
          include: { professionalProfile: { select: { id: true } }, resumes: { select: { resumeId: true } } },
        },
      },
    });
  }

  async getPessoaFisicaByDocument(userDocument: string): Promise<TUserWithPfAndProfileOutput> {
    return await this.prismaService.user.findUnique({
      where: { numeroDocumento: userDocument },
      include: {
        pessoaFisica: {
          include: { professionalProfile: { select: { id: true } }, resumes: { select: { resumeId: true } } },
        },
      },
    });
  }

  async getManyPessoaFisicaByCPFWithBasicInfo(cpfs: Array<string>): Promise<TUserPfWithBasicInfoOutput[]> {
    const existingUsers = await this.prismaService.pessoaFisica.findMany({
      where: { CPF: { in: cpfs } },
      select: { nome: true, CPF: true, email: true, telefone: true },
    });
    return existingUsers;
  }

  async getPessoaJuridicaByUserId(userId: string): Promise<TUserWithPjAndLtiAndKeysOutput> {
    return await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        pessoaJuridica: { include: { ltiConfiguration: true } },
        apiKey: { where: { isDeleted: false } },
      },
    });
  }

  async getUsersByStatus(status: UserStatus): Promise<Array<TUserPfAndPjAndDocumentOutput>> {
    return await this.prismaService.user.findMany({
      where: { status: status },
      include: {
        document: true,
        pessoaFisica: true,
        pessoaJuridica: { select: { nomeFantasia: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserWithPfAndPjById(userId: string): Promise<TUserPfAndPjAndPartnersOutput> {
    return await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { document: true, pessoaFisica: true, pessoaJuridica: { include: { socios: true } } },
    });
  }

  async getUsersPfByDocumentNumbers(cpfs: Array<string>): Promise<Array<TUserPfWithSchoolsOutput>> {
    return await this.prismaService.user.findMany({
      where: { numeroDocumento: { in: cpfs } },
      include: { pessoaFisica: { include: { schools: true } } },
    });
  }

  async getUsersPfByIds(userIds: Array<string>): Promise<Array<TUserPfWithSchoolsOutput>> {
    return await this.prismaService.user.findMany({
      where: { id: { in: userIds } },
      include: { pessoaFisica: { include: { schools: true } } },
    });
  }

  async getUserPfByDocumentWithSchools(cpf: string): Promise<TUserPfWithSchoolsOutput> {
    return await this.prismaService.user.findUnique({
      where: { numeroDocumento: cpf },
      include: { pessoaFisica: { include: { schools: true } } },
    });
  }

  async getUsersPfAssociatedWithPjSchools(idPj: string): Promise<Array<TUserPfWithSchoolsOutput>> {
    return await this.prismaService.user.findMany({
      where: { pessoaFisica: { schools: { some: { ownerUserId: idPj } } } },
      include: { pessoaFisica: { include: { schools: true } } },
    });
  }

  async getUserPfDocumentPictureRecordById(pictureId: string): Promise<TDocumentPictureOutput> {
    return await this.prismaService.documentsPictures.findUnique({
      where: { documentId: pictureId },
    });
  }

  async getUserLastDocumentPicture(userId: string): Promise<TDocumentPictureOutput> {
    return await this.prismaService.documentsPictures.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserReceivedCertificatesByDocument(userDocument: string): Promise<number> {
    return await this.prismaService.certificates.count({
      where: { AND: [{ receptorDoc: userDocument }, { emissorDoc: { not: userDocument } }] },
    });
  }

  async getUserEmmitedCertificatesByDocument(userDocument: string): Promise<number> {
    return await this.prismaService.certificates.count({
      where: { emissorDoc: userDocument },
    });
  }

  async getAllSchoolsStudents(schoolsIds: Array<string>): Promise<Array<TUserOnSchoolsOutput>> {
    return await this.prismaService.user.findMany({
      where: {
        OR: [
          { tempSchool: { in: schoolsIds } },
          { pessoaFisica: { schools: { some: { schoolId: { in: schoolsIds } } } } },
        ],
      },
      include: {
        pessoaFisica: {
          include: {
            courses: { include: { course: true } },
            schools: true,
          },
        },
      },
      orderBy: { pessoaFisica: { nome: 'asc' } },
    });
  }

  async getAllCoursesStudents(courseIds: Array<string>): Promise<Array<TUserOnCourseOutput>> {
    return await this.prismaService.user.findMany({
      where: {
        OR: [
          { tempCourse: { in: courseIds } },
          { pessoaFisica: { courses: { some: { courseId: { in: courseIds } } } } },
        ],
      },
      include: { pessoaFisica: true },
      orderBy: { pessoaFisica: { nome: 'asc' } },
    });
  }

  async getSchoolsStudentsPaginated(
    schoolsIds: Array<string>,
    limit: number,
    skip: number,
  ): Promise<Array<TUserOnSchoolsOutput>> {
    return await this.prismaService.user.findMany({
      where: {
        OR: [
          { tempSchool: { in: schoolsIds } },
          { pessoaFisica: { schools: { some: { schoolId: { in: schoolsIds } } } } },
        ],
      },
      include: {
        pessoaFisica: {
          include: {
            courses: { include: { course: true } },
            schools: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      skip: skip,
    });
  }

  async getUserInstitutionalPjs(idPf: string): Promise<Array<TPjAdminsWithPjOutput>> {
    return await this.prismaService.pJAdmins.findMany({
      where: { idPF: idPf },
      include: { pj: true },
    });
  }

  async getUserCorporatePjs(idPf: string): Promise<Array<TCorporateAdminsWithPjOutput>> {
    return await this.prismaService.corporateAdmins.findMany({
      where: { idPF: idPf },
      include: { pj: true },
    });
  }

  async getUserCompanies(idPf: string): Promise<Array<IUserCompanies>> {
    const institutional = await this.getUserInstitutionalPjs(idPf);
    const corporate = await this.getUserCorporatePjs(idPf);

    const institutionalAdmin = institutional.map((pj) => {
      return {
        name: pj.pj.nomeFantasia,
        pjId: pj.idPJ,
        statusAssociation: pj.status,
        role: pj.role,
        environment: EnvironmentEnum.institutional,
      };
    });

    const corporateAdmin = corporate.map((pj) => {
      return {
        name: pj.pj.nomeFantasia,
        pjId: pj.idPJ,
        statusAssociation: pj.status,
        role: pj.role,
        environment: EnvironmentEnum.corporate,
      };
    });

    return [...institutionalAdmin, ...corporateAdmin];
  }

  async getPjInstitutionalAdmins(idPj: string): Promise<Array<TPjAdminsWithPfOutput>> {
    return await this.prismaService.pJAdmins.findMany({
      where: { idPJ: idPj },
      include: { pf: { include: { user: true } } },
    });
  }

  async getPjCorporateAdmins(idPj: string): Promise<Array<TCorporateAdminsWithPfOutput>> {
    return await this.prismaService.corporateAdmins.findMany({
      where: { idPJ: idPj },
      include: { pf: { include: { user: true } } },
    });
  }

  async updateUserStatusAdmin(userId: string, newStatus: UserStatus) {
    return await this.prismaService.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });
  }

  async updateUserFreeCertificatesAdmin(userId: string, freeCertificates: boolean) {
    return await this.prismaService.user.update({
      where: { id: userId },
      data: { freeCertificates: !freeCertificates },
    });
  }

  async updatePfUserInfoAdmin(userId: string, data: TPessoaFisicaUpdateInput): Promise<TPessoaFisicaOutput> {
    return await this.prismaService.pessoaFisica.update({
      where: { userId: userId },
      data: data,
    });
  }

  async updatePfInfo(userId: string, data: TPessoaFisicaUpdateInput): Promise<TPessoaFisicaOutput> {
    return await this.prismaService.pessoaFisica.update({
      where: { userId: userId },
      data: data,
    });
  }

  async updatePjUserInfoAdmin(
    userId: string,
    data: TPessoaJuridicaUpdateInput,
  ): Promise<TPessoaJuridicaWithSociosOutput> {
    return await this.prismaService.pessoaJuridica.update({
      where: { userId: userId },
      data: data,
      include: { socios: true },
    });
  }

  async updateRawUserInfo(pfData: TPessoaFisicaCreateInput) {
    await this.prismaService.pessoaFisica.create({
      data: pfData,
    });

    await this.prismaService.user.update({
      where: { id: pfData.user.connect.id },
      data: { tempName: null, tempPhone: null, tempSchool: null, tempCourse: null },
    });
  }

  async updateUserDocumentPictureStatus(pictureId: string, status: CertificateStatus) {
    await this.prismaService.documentsPictures.update({
      where: { documentId: pictureId },
      data: { status: status },
    });
  }

  async deleteUser(userId: string) {
    await this.prismaService.user.delete({
      where: { id: userId },
    });
  }

  async associateUsersToSchool(
    schoolId: string,
    usersDocuments: Array<string>,
  ): Promise<Array<TUserPfWithSchoolsOutput>> {
    const usersRecords = await this.getUsersPfByDocumentNumbers(usersDocuments);

    const rawUsersDocs = usersDocuments.filter(
      (docNumber) => !usersRecords.map((user) => user?.pessoaFisica?.CPF).includes(docNumber),
    );

    const connections = usersRecords
      .filter((user) => user?.pessoaFisica)
      .map((user) => ({ idPF: user.pessoaFisica.idPF }));

    if (connections.length > 0) {
      await this.prismaService.schools.update({
        where: { schoolId: schoolId },
        data: { students: { connect: connections } },
      });
    }

    if (rawUsersDocs.length > 0) {
      const rawUsers = usersRecords.filter((user) => !user.pessoaFisica && !user.tempSchool);

      const p = rawUsers.map(async (rawUser) => {
        await this.prismaService.user.update({
          where: { id: rawUser.id },
          data: {
            tempSchool: schoolId,
          },
        });
      });

      await Promise.all(p);
    }

    return await this.getUsersPfByDocumentNumbers(usersDocuments);
  }

  async disassociateUsersFromSchool(
    schoolId: string,
    usersDocuments: Array<string>,
  ): Promise<Array<TUserPfWithSchoolsOutput>> {
    const usersRecords = await this.getUsersPfByDocumentNumbers(usersDocuments);

    const disconnects = usersRecords.map((user) => {
      if (user.pessoaFisica.schools.map((school) => school.schoolId).includes(schoolId)) {
        return { idPF: user.pessoaFisica.idPF };
      }
    });

    if (disconnects.length > 0) {
      await this.prismaService.schools.update({
        where: { schoolId: schoolId },
        data: { students: { disconnect: disconnects } },
      });
    }

    return await this.getUsersPfByDocumentNumbers(usersDocuments);
  }

  async enableUserLTI(userId: string) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { ltiEnabled: true },
    });
  }

  async disableUserLTI(userId: string) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { ltiEnabled: false },
    });
  }

  createUniqueDocumentPictureHash(userId: string, createdAt: Date): string {
    const stringHash = `${userId}${createdAt}`;
    return createHash('sha256').update(stringHash).digest('hex');
  }

  async createUserDocPicture(data: TDocumentPictureCreateInput) {
    await this.prismaService.documentsPictures.create({
      data: data,
    });
  }

  async getUserImportsById(importId: string): Promise<{
    results: Prisma.UserImportsGetPayload<{}>[];
    schoolId: string;
    schoolName: string;
    courseId?: string;
    courseName?: string;
  }> {
    const results = await this.prismaService.userImports.findMany({
      where: { importId: importId },
    });

    const schoolId = results[0].schoolId;
    const courseId = results[0].courseId;

    const schoolName = await this.schoolsService.getSchoolName(schoolId);
    const courseName = await this.coursesService.getCourseName(courseId);

    return { results, schoolId, schoolName, courseId, courseName };
  }

  async listUserImports(
    dto: UserImportsListDto,
    pjId: string,
  ): Promise<{
    results: Prisma.UserImportsGetPayload<{}>[];
    counts: { importId: string; errorOnImport: boolean; _count: { errorOnImport: number } }[];
    schoolName: string;
    courseName: string;
    hasNextPage: boolean;
  }> {
    const results = await this.prismaService.userImports.findMany({
      distinct: ['importId'],
      where: {
        pjId,
      },
      take: dto.limit,
      skip: dto.page * dto.limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const schoolName = await this.schoolsService.getSchoolName(results[0].schoolId);
    const courseName = await this.coursesService.getCourseName(results[0].courseId);

    const counts = await this.prismaService.userImports.groupBy({
      by: ['importId', 'errorOnImport'],
      where: {
        pjId,
        importId: { in: results.map((event) => event.importId) },
      },
      _count: {
        errorOnImport: true,
      },
    });

    const hasNextPage = results.length > dto.limit;

    return { results, counts, schoolName, courseName, hasNextPage };
  }

  async saveUserImport(
    importId: string,
    schoolId: string,
    courseId: string | null,
    pjId: string,
    usersData: IResponseUsersRawInfo[],
  ) {
    await this.prismaService.userImports.createMany({
      data: usersData.map((user) => {
        return {
          pjId,
          importId: importId,
          userDocument: user.documentNumber,
          userEmail: user.documentNumber,
          userName: user.name ?? '',
          userPhone: user.phone ?? '',
          errorOnImport: !user.isValid,
          schoolId: schoolId,
          courseId: courseId ?? null,
        };
      }),
    });
  }
}
