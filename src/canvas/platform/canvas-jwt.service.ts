import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SecretManagerService } from '../../aws/secrets-manager/secrets-manager.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ICanvasUserAuthPayload,
  ICanvasUserData,
  ICanvasUserVerifiedPayload,
} from './interfaces/canvas-platform.interfaces';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CanvasJwtService {
  private secret: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly smsService: SecretManagerService,
    private readonly configService: ConfigService,
  ) {}

  getJwtSecret(): string {
    return this.secret;
  }

  async onModuleInit() {
    const isLocal = await this.configService.get('LOCAL_DEVELOPMENT');

    if (isLocal === 'true') {
      this.secret = 'SEGREDO_LOCAL';
    } else {
      this.secret = await this.smsService.getSecretFromKey('BackendJWTSecret');
    }
  }

  async getCanvasUserInformation(userId: string, courseId: string, schoolId: string): Promise<ICanvasUserData> {
    const pjInfo = await this.prismaService.pessoaJuridica.findUnique({
      where: { userId: userId },
      include: {
        user: { select: { email: true } },
      },
    });

    if (!pjInfo) {
      throw new ForbiddenException('User not Found');
    }

    const schoolInfo = await this.prismaService.schools.findUnique({
      where: { schoolId: schoolId },
      include: { courses: { include: { course: { include: { canvasCourse: true } } } } },
    });

    if (!schoolInfo) {
      throw new ForbiddenException('School not Found');
    }

    // if (!schoolInfo.isCanvas) {
    //   throw new ForbiddenException('School is not Canvas');
    // }

    if (!schoolInfo?.courses) {
      throw new ForbiddenException('Course not Found');
    }
    

    if (!schoolInfo.courses.map((course) => course.course.courseId).includes(courseId)) {
      throw new ForbiddenException('Course not Found');
    }

    if (schoolInfo?.courses.map((x) => x.course?.canvasCourseId).length === 0) {
      throw new ForbiddenException('Course not Found');
    }

    const response: ICanvasUserData = {
      userId: userId,
      email: pjInfo.user.email,
      courseId: courseId,
      schoolId: schoolId,
    };

    return response;
  }

  async createJwtTokenFromState(state: string): Promise<string> {
    const data = await this.prismaService.canvasEphemeralLogin.findUnique({
      where: { state: state, isValid: true, isDeleted: false, expiresAt: { gt: new Date() } },
    });

    if (!data || !data?.userId) {
      throw new ForbiddenException();
    }

    await this.prismaService.canvasEphemeralLogin.update({
      where: { id: data.id },
      data: {
        isValid: false,
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return this.createJwtToken({
      userId: data.userId,
      schoolId: data.schoolId,
      courseId: data.courseId,
    });
  }

  createJwtToken(payload: ICanvasUserAuthPayload): string {
    const token = jwt.sign(payload, this.secret, { expiresIn: '1h' });

    return token;
  }

  refreshJwtToken(token: string): string {
    console.log(token);
    try {
      const payload = jwt.verify(token, this.secret) as ICanvasUserVerifiedPayload;
      const { iat, exp, ...newPayload } = payload;
      return this.createJwtToken(newPayload);
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Invalid Token');
    }
  }
}
