import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';
import { CanvasRepository } from './repository/canvas.repository';
import {
  CreateInternalCanvasConfigurationDto,
  CreateOrUpdateCanvasConfigurationDto,
} from './dto/create-canvas-configuration.dto';
import { LTILaunchInfo } from './lti/auth/lti-launch-info.interface';
import { LtiService } from './lti/lti.service';
import { CustomLogger } from '../logger/custom-logger.service';
import { CanvasApiClient } from './canvas.client';
import { ICanvasCourseUsersResponse } from './types/canvas-course-users-response.interface';
import { ICreateCanvasUsers } from './types/create-canvas-users.interface';
import { SchoolsService } from '../schools/schools.service';
import { EducationLevelEnum, User } from '@prisma/client';
import { CoursesService } from '../courses/courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { SecretManagerService } from '../aws/secrets-manager/secrets-manager.service';
import { TSchoolCreateInput, TSchoolOutput } from '../schools/types/schools.types';
import { TCourseCreateInput } from '../courses/types/courses.types';
import { AuthService } from '../auth/auth.service';
import { TUserCreateInput } from '../auth/types/auth.types';
import { IResponseUsersRawInfo } from '../auth/interfaces/auth.interfaces';

@Injectable()
export class CanvasService {
  algorithm: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly smsService: SecretManagerService,
    private readonly canvasRepository: CanvasRepository,
    private readonly ltiService: LtiService,
    private readonly logger: CustomLogger,
    private readonly schoolsService: SchoolsService,
    private readonly authService: AuthService,
    private readonly coursesService: CoursesService,
    private readonly prismaService: PrismaService,
    private readonly canvasApiClient: CanvasApiClient,
  ) {
    this.algorithm = 'aes-256-cbc';
  }

  async getOauth2RedirectUrl(ltiLaunchInfo: LTILaunchInfo, state: string): Promise<string> {
    if (!this.ltiService.isCourseNavigation(ltiLaunchInfo) || !this.ltiService.isInstructor(ltiLaunchInfo)) {
      this.logger.info({ message: 'User is not an instructor or course navigation is not enabled' });

      await this.prismaService.canvasEphemeralLogin.update({
        where: { state: state },
        data: {
          isValid: false,
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      return this.configService.getOrThrow('CERTIFIKEDU_FRONTEND_URL'); //TODO: mudar para pagina normal ao invés de auth
    }

    const ltiConfiguration = await this.canvasRepository.getLTIConfigurationByClientIdAndDomain(
      ltiLaunchInfo.ltiClientId,
      `https://${ltiLaunchInfo.canvasCustomParameters.canvasApiDomain}`,
    );

    if (!ltiConfiguration) {
      this.logger.info({ message: 'LTI configuration not found' });
      await this.prismaService.canvasEphemeralLogin.update({
        where: { state: state },
        data: {
          isValid: false,
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
      return this.configService.getOrThrow('CERTIFIKEDU_FRONTEND_URL'); //TODO: mudar para pagina erro ao invés de auth
    }

    this.logger.info({ message: 'LTI configuration found' });
    this.logger.info({ message: 'Getting Canvas Token' });
    const canvasToken = await this.canvasApiClient.getToken(ltiLaunchInfo, {
      canvasClientIdDevKey: ltiConfiguration.canvasClientIdDevKey,
      decryptedCanvasClientSecretDevKey: await this.decrypt({
        iv: ltiConfiguration.iv,
        content: ltiConfiguration.canvasClientSecretDevKey,
      }),
      domain: ltiConfiguration.canvasDomain,
    });

    if (!canvasToken) {
      this.logger.info({ message: 'Canvas Token not found for user - redirecting to canvas oauth2' });

      const returnUrl = await this.canvasApiClient.getOauth2RedirectUrl(
        ltiLaunchInfo,
        {
          canvasClientIdDevKey: ltiConfiguration.canvasClientIdDevKey,
          canvasDomain: ltiConfiguration.canvasDomain,
          id: ltiConfiguration.id,
        },
        state,
      );

      return returnUrl;
    }

    // Se um token existe, entao o curso ja foi criado uma vez junto com os alunos
    // Nesse caso, precisamos filtrar novos possiveis alunos que possam ter entrado no curso, criar eles e associar ao curso

    const courseUsers = await this.canvasApiClient.getAllCourseUsers(
      ltiLaunchInfo.canvasCustomParameters.canvasCourseId,
      ltiConfiguration.canvasDomain,
    );

    const pjUser = await this.canvasRepository.getUserByPjId(ltiConfiguration.idPJ);

    const canvasCourse = await this.prismaService.canvasCourse.findFirst({
      where: {
        canvasCourseId: Number(ltiLaunchInfo.canvasCustomParameters.canvasCourseId),
        canvasDomain: ltiConfiguration.canvasDomain,
      },
      include: {
        course: true,
      },
    });

    let courseId = canvasCourse?.courseId ?? '';

    if (!canvasCourse) {
      const courseData: TCourseCreateInput = {
        name: ltiLaunchInfo.context.title,
        description: ltiLaunchInfo.context.label,
        educationLevel: EducationLevelEnum.Graduacao,
        canvasCourseId: Number(ltiLaunchInfo.canvasCustomParameters.canvasCourseId),
        schools: { create: { schoolId: ltiConfiguration.school.schoolId } },
        user: { connect: { userId: pjUser.id } },
      };

      const newCourse = await this.coursesService.createCourse(courseData);

      courseId = newCourse.courseId;
      await this.prismaService.canvasCourse.create({
        data: {
          canvasCourseId: Number(ltiLaunchInfo.canvasCustomParameters.canvasCourseId),
          canvasDomain: ltiConfiguration.canvasDomain,
          canvasDescription: ltiLaunchInfo.context.label,
          canvasName: ltiLaunchInfo.context.title,
          canvasEndDate: ltiLaunchInfo.canvasCustomParameters.canvasCourseEndAt,
          canvasStartDate: ltiLaunchInfo.canvasCustomParameters.canvasCourseStartAt,
          canvasTotalStudents: courseUsers.length,
          course: {
            connect: {
              courseId: newCourse.courseId,
            },
          },
        },
      });
    }

    await this.createUsers(
      courseUsers,
      ltiConfiguration.canvasDomain,
      ltiLaunchInfo.canvasCustomParameters.canvasUserId,
      ltiConfiguration.school.schoolId,
      courseId,
    );

    await this.prismaService.canvasEphemeralLogin.update({
      where: { state: state },
      data: {
        userId: pjUser.id,
        schoolId: ltiConfiguration.school.schoolId,
        courseId: courseId,
      },
    });

    const role = this.ltiService.isInstructor(ltiLaunchInfo) ? 'teacher' : 'other';

    return `${this.configService.getOrThrow<string>(
      'CERTIFIKEDU_FRONTEND_URL',
    )}/canvas/auth?Canvas-Token=${state}&role=${role}`;
  }

  private async createUsers(
    data: ICanvasCourseUsersResponse[],
    domain: string,
    teacherCanvasId: string,
    schoolId: string,
    courseId: string,
  ) {
    const dataToCreateUsers: ICreateCanvasUsers[] = data.map((user) => {
      return {
        canvasUserId: user.id,
        documentNumber: randomUUID(),
        name: user.name,
        email: user.email,
        fromCanvas: true,
        domain: domain,
        isTeacher: user.id === Number(teacherCanvasId),
      };
    });

    await this.canvasRepository.createCanvasUsers(dataToCreateUsers);

    const rawUsersInfo = await Promise.all(
      dataToCreateUsers.map(async (user) => {
        const responseDict: IResponseUsersRawInfo = {
          name: user?.name ?? '',
          phone: '',
          email: user.email,
          documentNumber: user.documentNumber,
          isValid: true,
        };

        const userData: TUserCreateInput = {
          email: user.email,
          numeroDocumento: user.documentNumber,
          type: 'PF',
          tempName: user?.name ?? null,
          tempSchool: schoolId,
          tempCourse: courseId,
        };

        return await this.authService.signUpRawUser(userData, responseDict);
      }),
    );

    const successUser = rawUsersInfo.filter((user) => user.isValid);
    const errorUsers = rawUsersInfo.filter((user) => !user.isValid);

    this.logger.info({
      message: `${dataToCreateUsers.length} users to create; success: ${successUser.length}; errors: ${errorUsers.length}`,
      success: successUser,
      errors: errorUsers,
    });
  }

  async handleOauth2Callback(code: string, state: string): Promise<string> {
    const loginIntent = await this.canvasRepository.getLoginIntent(state);

    if (!loginIntent) {
      throw new NotFoundException('LTI configuration not found');
    }
    const ltiLaunchInfo = JSON.parse(JSON.stringify(loginIntent.ltiLaunchInfo)) as LTILaunchInfo;

    const ltiConfiguration = await this.canvasRepository.getLTIConfiguration(loginIntent.canvasLTIConfigurationId);

    if (!ltiConfiguration) {
      throw new NotFoundException('LTI configuration not found');
    }

    const canvasToken = await this.canvasApiClient.getToken(ltiLaunchInfo, {
      canvasClientIdDevKey: ltiConfiguration.canvasClientIdDevKey,
      decryptedCanvasClientSecretDevKey: await this.decrypt({
        iv: ltiConfiguration.iv,
        content: ltiConfiguration.canvasClientSecretDevKey,
      }),
      domain: ltiConfiguration.canvasDomain,
    });

    if (!canvasToken) {
      await this.canvasApiClient.generateNewUserToken(code, {
        canvasClientIdDevKey: ltiConfiguration.canvasClientIdDevKey,
        decryptedCanvasClientSecretDevKey: await this.decrypt({
          iv: ltiConfiguration.iv,
          content: ltiConfiguration.canvasClientSecretDevKey,
        }),
        canvasDomain: ltiConfiguration.canvasDomain,
      });
    }

    const courseUsers = await this.canvasApiClient.getAllCourseUsers(
      ltiLaunchInfo.canvasCustomParameters.canvasCourseId,
      ltiConfiguration.canvasDomain,
    );

    const pjUser = await this.canvasRepository.getUserByPjId(ltiConfiguration.idPJ);

    const course = await this.prismaService.course.findFirst({
      where: { canvasCourseId: Number(ltiLaunchInfo.canvasCustomParameters.canvasCourseId) },
    });

    let courseId: string;
    if (!course) {
      const courseData: TCourseCreateInput = {
        name: ltiLaunchInfo.context.title,
        description: ltiLaunchInfo.context.label,
        educationLevel: EducationLevelEnum.Graduacao,
        canvasCourseId: Number(ltiLaunchInfo.canvasCustomParameters.canvasCourseId),
        schools: { create: { schoolId: ltiConfiguration.school.schoolId } },
        user: { connect: { userId: pjUser.id } },
      };

      const newCourse = await this.coursesService.createCourse(courseData);

      await this.prismaService.canvasCourse.create({
        data: {
          canvasCourseId: Number(ltiLaunchInfo.canvasCustomParameters.canvasCourseId),
          canvasDomain: ltiConfiguration.canvasDomain,
          canvasDescription: ltiLaunchInfo.context.label,
          canvasName: ltiLaunchInfo.context.title,
          canvasEndDate: ltiLaunchInfo.canvasCustomParameters.canvasCourseEndAt,
          canvasStartDate: ltiLaunchInfo.canvasCustomParameters.canvasCourseStartAt,
          canvasTotalStudents: courseUsers.length,
          course: {
            connect: {
              courseId: newCourse.courseId,
            },
          },
        },
      });

      courseId = newCourse.courseId;
    }

    await this.createUsers(
      courseUsers,
      ltiConfiguration.canvasDomain,
      ltiLaunchInfo.canvasCustomParameters.canvasUserId,
      ltiConfiguration.school.schoolId,
      course?.courseId ?? courseId,
    );

    await this.prismaService.canvasEphemeralLogin.update({
      where: { state: state },
      data: {
        userId: pjUser.id,
        courseId: course?.courseId ?? courseId,
        schoolId: ltiConfiguration.school.schoolId,
      },
    });

    const role = this.ltiService.isInstructor(ltiLaunchInfo) ? 'teacher' : 'other';

    return `${this.configService.getOrThrow<string>(
      'CERTIFIKEDU_FRONTEND_URL',
    )}/canvas/auth?Canvas-Token=${state}&role=${role}`;
  }

  async getLTIConfiguration(userId: string) {
    const idPJ = await this.canvasRepository.getIdPJ(userId);
    const config = await this.canvasRepository.getLTIConfigurationByPj(idPJ);

    if (!config) {
      throw new NotFoundException('LTI configuration not found');
    }
    return config;
  }

  async encrypt(text: string, iv: Buffer): Promise<string> {
    const secretId = 'BackendEncryptionKey';

    const secretKey = await this.smsService.getSecretFromKey(secretId);

    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(secretKey), iv);

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString('hex');
  }

  async decrypt(hash: { iv: string; content: string }): Promise<string> {
    const secretId = 'BackendEncryptionKey';

    const secretKey = await this.smsService.getSecretFromKey(secretId);

    const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(secretKey), Buffer.from(hash.iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(hash.content, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }

  async createLTIConfiguration(user: User, dto: CreateOrUpdateCanvasConfigurationDto) {
    const hasLti = await this.canvasRepository.getLTIFlag(user.id);

    if (hasLti) {
      throw new BadRequestException('User already has an LTI configuration');
    }

    const pj = await this.prismaService.pessoaJuridica.findFirst({
      where: { userId: user.id },
    });

    let canvasSchool: TSchoolOutput;

    canvasSchool = await this.prismaService.schools.findFirst({
      where: { schoolCnpj: pj.CNPJ, isCanvas: true },
    });

    if (!canvasSchool) {
      const schoolData: TSchoolCreateInput = {
        name: 'Canvas da Instituição',
        description: 'Canvas da Instituição para integração com a CertifikEDU',
        email: user.email,
        homepageUrl: dto.canvasDomain,
        phoneNumber: user.tempPhone,
        schoolCnpj: pj.CNPJ,
        isCanvas: true,
        userId: { connect: { idPJ: pj.idPJ } },
      };

      canvasSchool = await this.schoolsService.createSchool(schoolData);
    }

    const iv = crypto.randomBytes(16);

    const internalDto: CreateInternalCanvasConfigurationDto = { ...dto, iv: iv.toString('hex') };

    internalDto.canvasClientSecretLTI = await this.encrypt(dto.canvasClientSecretLTI, iv);
    internalDto.canvasClientSecretDevKey = await this.encrypt(dto.canvasClientSecretDevKey, iv);

    const createdConfig = await this.canvasRepository.createLTIConfiguration(
      user.id,
      internalDto,
      canvasSchool.schoolId,
    );

    return createdConfig;
  }

  async updateLTIConfiguration(userId: string, dto: CreateOrUpdateCanvasConfigurationDto) {
    const hasLti = await this.canvasRepository.getLTIFlag(userId);

    if (!hasLti) throw new NotFoundException('User does not have an LTI config');

    const iv = crypto.randomBytes(16);

    const internalDto: CreateInternalCanvasConfigurationDto = { ...dto, iv: iv.toString('hex') };

    internalDto.canvasClientSecretLTI = await this.encrypt(dto.canvasClientSecretLTI, iv);
    internalDto.canvasClientSecretDevKey = await this.encrypt(dto.canvasClientSecretDevKey, iv);

    const updatedConfig = await this.canvasRepository.updateLTIConfiguration(userId, internalDto);

    return updatedConfig;
  }

  async getCanvasConfigurations() {
    return {
      redirectUri: this.configService.getOrThrow('CANVAS_OAUTH2_REDIRECT_URI'),
    };
  }
}
