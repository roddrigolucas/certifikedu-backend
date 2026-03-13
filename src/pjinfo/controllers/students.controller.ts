import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../auth/decorators';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { PJRoles } from '../decorators/roles-pj.decorator';
import { PJRolesGuard } from '../guards/roles-guards-pj.guard';
import { ResponseCreateSchoolPjInfoDto } from '../dtos/schools/schools-response.dto';
import { CreateCourseStudentsAssociationPjInfoDto } from '../dtos/courses/courses-input.dto';
import { AuxService } from '../../_aux/_aux.service';
import { SchoolsService } from '../../schools/schools.service';
import { AuthService } from '../../auth/auth.service';
import { IResponseUsersRawInfo } from '../../auth/interfaces/auth.interfaces';
import { TPessoaFisicaCreateWoUserInput, TUserCreateInput } from '../../auth/types/auth.types';
import { UsersService } from '../../users/users.service';
import { CognitoService } from '../../aws/cognito/cognito.service';
import { SESService } from '../../aws/ses/ses.service';
import { CoursesService } from '../../courses/courses.service';
import { CertificatesService } from '../../certificates/certificates.service';
import {
  AuthRawUserPjInfoDto,
  CreateOrDeleteStudentsAssociationPjInfoDto,
  CreateStudentPjInfoDto,
  PaginationQueryPjInfoDto,
  UserImportsListDto,
} from '../dtos/students/students-input.dto';
import {
  ResponseRawUsersPjInfoDto,
  ResponseStudentsBySchoolPjInfoDto,
  ResponseStudentsPjInfoDto,
  StudentImportsListResponseDto,
  StudentsImportsDetailResponseDto,
} from '../dtos/students/students-response.dto';
import { randomUUID } from 'crypto';

@ApiTags('Institutional -- Students')
@Controller('pj/:pjId')
@UseGuards(JwtGuard)
export class StudentsInstitutionalController {
  constructor(
    private readonly auxService: AuxService,
    private readonly authService: AuthService,
    private readonly schoolsService: SchoolsService,
    private readonly coursesService: CoursesService,
    private readonly certificatesService: CertificatesService,
    private readonly usersService: UsersService,
    private readonly cognitoService: CognitoService,
    private readonly sesService: SESService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Post('signup/raw')
  async signRawUser(
    @GetUser('id') userId: string,
    @Body() dto: AuthRawUserPjInfoDto,
  ): Promise<ResponseRawUsersPjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const school = await this.schoolsService.getSchoolById(dto.school);

    if (!school) {
      throw new NotFoundException('School not Found');
    }

    if (school.ownerUserId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this school');
    }

    const usersData = dto.users.map(async (user) => {
      const responseDict: IResponseUsersRawInfo = {
        name: user?.name ?? '',
        phone: user?.phone ?? '',
        email: user.email,
        documentNumber: user.documentNumber,
        isValid: true,
      };

      const userData: TUserCreateInput = {
        email: user.email,
        numeroDocumento: user.documentNumber,
        type: 'PF',
        tempName: user?.name ?? null,
        tempPhone: user?.phone ?? null,
        tempSchool: dto.school,
      };

      if (dto?.courseId) {
        userData.tempCourse = dto.courseId;
      }

      try {
        return await this.authService.signUpRawUser(userData, responseDict);
      } catch (err) {
        responseDict.error = '';
        responseDict.isValid = false;
        return responseDict;
      }
    });

    const resolvedUsersData = await Promise.all(usersData);

    const importId = randomUUID();
    await this.usersService.saveUserImport(importId, school.schoolId, dto.courseId, pj.idPJ, resolvedUsersData);

    return {
      users: resolvedUsersData,
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Post('/student')
  async createStudent(
    @GetUser('id') userId: string,
    @Body() dto: CreateStudentPjInfoDto,
  ): Promise<ResponseCreateSchoolPjInfoDto> {
    const dob = this.auxService.formatDate(dto.dob);
    if (!dob) {
      throw new BadRequestException('Data de nascimento invalida');
    }

    const pj = await this.auxService.getPjInfo(userId);
    const school = await this.schoolsService.getSchoolById(dto.schoolId);

    if (!school) {
      throw new NotFoundException('school not found');
    }

    if (school.ownerUserId != pj.idPJ) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const checkUser = await this.authService.checkUser(dto.document, dto.email);

    if (checkUser.exist) {
      throw new BadRequestException(checkUser.errorMessage);
    }

    const pf: TPessoaFisicaCreateWoUserInput = {
      nome: dto.name,
      telefone: dto.phone,
      dataDeNascimento: dob,
      cepNumber: dto.address.zipCode,
      estado: dto.address.state,
      cidade: dto.address.city,
      bairro: dto.address.neighborhood,
      rua: dto.address.street,
      numero: dto.address.streetNumber,
      complemento: dto.address.complementary ?? '',
      schools: { connect: { schoolId: school.schoolId } },
    };

    const data: TUserCreateInput = {
      numeroDocumento: dto.document,
      email: dto.email,
      type: 'PF',
      pessoaFisica: { create: pf },
    };

    const password = this.auxService.generateRandomPassword();

    this.cognitoService.adminCreateNewUserCognito({ email: data.email, userType: 'PF', password: password });

    this.sesService.sendNewUserPassword(data.email, password, data?.tempName ?? '');

    await this.authService.signUpPfUserWithoutCognito(data);

    return {
      statusCode: 201,
      status: 'Success',
      response: {
        message: 'Aluno Cadastrado com sucesso.',
      },
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('review')
  @PJRoles('basico')
  @Get('/students/school/:schoolId')
  async pjStudentsBySchool(
    @GetUser('id') userId: string,
    @Param('schoolId') schoolId: string,
  ): Promise<ResponseStudentsBySchoolPjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const school = await this.schoolsService.getSchoolById(schoolId);

    if (!school) {
      throw new NotFoundException('School not Found');
    }

    if (school.ownerUserId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this school');
    }

    const students = await this.usersService.getAllSchoolsStudents([schoolId]);

    const studentsData = students.map((student) => {
      if (!student?.pessoaFisica) {
        return {
          id: student.id,
          document: student.numeroDocumento,
          name: student.tempName ?? null,
          email: student.email,
          isTemporary: true,
        };
      }

      return {
        id: student.id,
        isTemporary: false,
        name: student.pessoaFisica.nome,
        email: student.email,
        document: student.numeroDocumento,
      };
    });

    return { students: studentsData };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('review')
  @PJRoles('basico')
  @Get('/students')
  async pjStudents(@GetUser('id') userId: string): Promise<ResponseStudentsPjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const schools = await this.schoolsService.getAllUserSchools(pj.idPJ);

    const schoolsIds = schools.map((school) => {
      return school.schoolId;
    });

    const students = await this.usersService.getAllSchoolsStudents(schoolsIds);

    const studentsData = students.map(async (student) => {
      const certificates = (
        await this.certificatesService.getUserCertificatesIdsWithSchoolIdsByDocument(student.numeroDocumento)
      ).filter((certificate) => schoolsIds.includes(certificate.schoolId));
      if (!student?.pessoaFisica) {
        const schoolName = schools.filter((school) => school.schoolId === student.tempSchool).at(0);
        const rawStudentInfo = {
          id: student.id,
          isTemp: true,
          name: student.tempName ?? null,
          email: student.email,
          document: student.numeroDocumento,
          certificateQty: certificates.length,
          schools: [{ schoolId: student.tempSchool, schoolName: schoolName.name }],
          courses: [],
        };

        if (student.tempCourse) {
          schoolName.courses.map((course) => {
            if (student.tempCourse === course.courseId) {
              rawStudentInfo.courses.push({ courseId: course.courseId, courseName: course.course.name });
            }
          });
        }

        return rawStudentInfo;
      }

      return {
        id: student.id,
        isTemp: false,
        name: student.pessoaFisica.nome,
        email: student.email,
        document: student.numeroDocumento,
        certificateQty: certificates.length,
        schools: student.pessoaFisica.schools.map((school) => {
          return { schoolName: school.name, schoolId: school.schoolId };
        }),
        courses: student.pessoaFisica.courses.map((course) => {
          return { courseName: course.course.name, courseId: course.course.courseId };
        }),
      };
    });

    return {
      statusCode: 200,
      status: 'Success',
      response: {
        hasNextPage: false,
        data: await Promise.all(studentsData),
      },
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('/students/page')
  async pjStudentsWithPagination(
    @GetUser('id') userId: string,
    @Query() pagDto: PaginationQueryPjInfoDto,
  ): Promise<ResponseStudentsPjInfoDto> {
    const { page = 1, limit = 10 } = pagDto;
    const skip = (page - 1) * limit;

    const pj = await this.auxService.getPjInfo(userId);

    const schools = await this.schoolsService.getAllUserSchools(pj.idPJ);

    const schoolsIds: Array<string> = [];
    if (pagDto?.schoolId) {
      const school = await this.schoolsService.getSchoolById(pagDto.schoolId);

      if (!school) {
        throw new NotFoundException('School not found');
      }

      schoolsIds.push(school.schoolId);
    } else {
      schools.map((school) => schoolsIds.push(school.schoolId));
    }

    const students = await this.usersService.getSchoolsStudentsPaginated(schoolsIds, limit, skip);

    const hasNextPage: boolean = students.length > limit;
    if (hasNextPage) {
      students.pop();
    }

    const studentsData = students.map(async (student) => {
      const certificates = (
        await this.certificatesService.getUserCertificatesIdsWithSchoolIdsByDocument(student.numeroDocumento)
      ).filter((certificate) => schoolsIds.includes(certificate.schoolId));
      if (!student?.pessoaFisica) {
        const schoolName = schools.filter((school) => school.schoolId === student.tempSchool).at(0);
        const rawStudentInfo = {
          id: student.id,
          isTemp: true,
          name: student.tempName ?? null,
          email: student.email,
          document: student.numeroDocumento,
          certificateQty: certificates.length,
          schools: [{ schoolId: student.tempSchool, schoolName: schoolName.name }],
          courses: [],
        };

        if (student.tempCourse) {
          console.log(student.tempCourse);
          schoolName.courses.map((course) => {
            if (student.tempCourse === course.courseId) {
              rawStudentInfo.courses.push({ courseId: course.courseId, courseName: course.course.name });
            }
          });
        }

        return rawStudentInfo;
      }

      return {
        id: student.id,
        isTemp: false,
        name: student.pessoaFisica.nome,
        email: student.email,
        document: student.numeroDocumento,
        certificateQty: certificates.length,
        schools: student.pessoaFisica.schools.map((school) => {
          return { schoolName: school.name, schoolId: school.schoolId };
        }),
        courses: student.pessoaFisica.courses.map((course) => {
          return { courseName: course.course.name, courseId: course.course.courseId };
        }),
      };
    });

    return {
      statusCode: 200,
      status: 'Success',
      response: {
        hasNextPage: hasNextPage,
        data: await Promise.all(studentsData),
      },
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Patch('/students/:schoolId/:courseId?')
  async createStudentAssociation(
    @GetUser('id') userId: string,
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateCourseStudentsAssociationPjInfoDto,
    @Param('courseId') courseId?: string,
  ): Promise<{ success: boolean }> {
    const pj = await this.auxService.getPjInfo(userId);

    const school = await this.schoolsService.getSchoolById(schoolId);

    if (!school) {
      throw new NotFoundException(`School not found.`);
    }

    if (!(school.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException(`User does not own this school`);
    }

    if (courseId) {
      const courses = await this.coursesService.getCoursesBySchool(schoolId);

      if (!courses.map((course) => course.courseId).includes(courseId)) {
        throw new ForbiddenException(`User does not own this school`);
      }
    }

    await this.usersService.associateUsersToSchool(schoolId, dto.cpfs);

    if (courseId) {
      await this.coursesService.addStudentToCourse(courseId, dto.cpfs);
    }

    return { success: true };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Delete('/students/:schoolId/')
  async deleteStudentAssociation(
    @GetUser('id') userId: string,
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateOrDeleteStudentsAssociationPjInfoDto,
    @Param('courseId') courseId?: string,
  ): Promise<{ success: boolean }> {
    const pj = await this.auxService.getPjInfo(userId);

    const school = await this.schoolsService.getSchoolById(schoolId);

    if (!school) {
      throw new NotFoundException(`School not found.`);
    }

    if (!(school.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException(`User does not own this school`);
    }

    await this.usersService.disassociateUsersFromSchool(schoolId, dto.cpfs);

    if (courseId) {
      await this.coursesService.removeStudentFromCourse(courseId, dto.cpfs);
    }

    return { success: true };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('/students/imports/:importId')
  async getUserImportDetails(@Param('importId') importId: string): Promise<StudentsImportsDetailResponseDto> {
    const data = await this.usersService.getUserImportsById(importId);
    const successQuantity = data.results.filter((user) => user.errorOnImport == false).length;
    const failedQuantity = data.results.filter((user) => user.errorOnImport == true).length;

    return {
      importId,
      students: data.results.map((user) => ({
        document: user.userDocument,
        email: user.userEmail,
        name: user.userName ?? '',
        phone: user.userPhone ?? '',
        errorOnImport: user.errorOnImport,
      })),
      schoolId: data.schoolId,
      schoolName: data.schoolName,
      courseId: data.courseId ?? '',
      courseName: data.courseName ?? '',
      successQuantity,
      failedQuantity,
      createdAt: data.results[0].createdAt,
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('/students/imports')
  async listUserImports(
    @GetUser('id') userId: string,
    @Query() paginationDto: UserImportsListDto,
  ): Promise<StudentImportsListResponseDto> {
    const pj = await this.auxService.getPjInfo(userId);
    const { results, counts, schoolName, courseName, hasNextPage } = await this.usersService.listUserImports(
      paginationDto,
      pj.idPJ,
    );

    return {
      data: results.map((result) => ({
        importId: result.importId,
        schoolId: result.schoolId,
        courseId: result.courseId,
        schoolName,
        courseName,
        createdAt: result.createdAt,
        successQuantity:
          counts.find((count) => count.importId === result.importId && count.errorOnImport === false)?._count
            .errorOnImport ?? 0,
        failedQuantity:
          counts.find((count) => count.importId === result.importId && count.errorOnImport === true)?._count
            .errorOnImport ?? 0,
      })),
      hasNextPage,
    };
  }
}
