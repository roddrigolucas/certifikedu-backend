import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateInternalCanvasConfigurationDto } from '../dto/create-canvas-configuration.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ICanvasAuthResponse } from '../types/canvas-auth-response.interface';
import { LTILaunchInfo } from '../lti/auth/lti-launch-info.interface';
import { ICreateCanvasUsers } from '../types/create-canvas-users.interface';

const ConfigWithoutSecrets = Prisma.validator<Prisma.CanvasLTIConfigurationSelect>()({
  id: true,
  idPJ: true,
  canvasClientIdLTI: true,
  canvasClientIdDevKey: true,
  canvasDomain: true,
});

@Injectable()
export class CanvasRepository {
  constructor(private prismaService: PrismaService) {}

  async getLTIConfigurationByClientIdAndDomain(canvasClientIdLTI: string, canvasDomain: string) {
    return this.prismaService.canvasLTIConfiguration.findFirst({
      where: { canvasClientIdLTI, canvasDomain },
      include: { school: true },
    });
  }

  //TODO: JOGAR PRA USER.REPOSITORY
  async getUserByPjId(idPJ: string) {
    const pj = await this.prismaService.pessoaJuridica.findUnique({ where: { idPJ }, include: { user: true } });
    return pj.user;
  }

  //TODO: JOGAR PRA PFINFO.REPOSITORY
  async getIdPJ(id: string) {
    return (await this.prismaService.pessoaJuridica.findUnique({ where: { userId: id } })).idPJ;
  }

  //TODO: JOGAR PRA USER.REPOSITORY
  async getLTIEnabledFlag(userId: string) {
    return (await this.prismaService.user.findUnique({ where: { id: userId } })).ltiEnabled;
  }

  async getLTIConfiguration(id: string) {
    return this.prismaService.canvasLTIConfiguration.findUnique({ where: { id }, include: { school: true } });
  }

  async getLTIConfigurationByPj(idPJ: string) {
    return this.prismaService.canvasLTIConfiguration.findUnique({
      where: { idPJ },
      select: ConfigWithoutSecrets,
    });
  }

  async getLTIFlag(userId: string): Promise<boolean> {
    const idPJ = await this.getIdPJ(userId);
    const config = await this.prismaService.canvasLTIConfiguration.findUnique({
      where: { idPJ },
    });

    if (!config) return false;

    return true;
  }

  async createLTIConfiguration(
    userId: string,
    dto: CreateInternalCanvasConfigurationDto,
    schoolId: string,
  ): Promise<string> {
    const idPJ = await this.getIdPJ(userId);

    return (
      await this.prismaService.canvasLTIConfiguration.create({
        data: {
          idPJ: idPJ,
          canvasClientSecretLTI: dto.canvasClientSecretLTI,
          canvasClientIdLTI: dto.canvasClientIdLTI,
          canvasClientIdDevKey: dto.canvasClientIdDevKey,
          canvasClientSecretDevKey: dto.canvasClientSecretDevKey,
          canvasDomain: dto.canvasDomain,
          iv: dto.iv,
          school: { connect: { schoolId } },
        },
      })
    ).id;
  }

  async updateLTIConfiguration(userId: string, dto: CreateInternalCanvasConfigurationDto) {
    const idPJ = await this.getIdPJ(userId);

    return await this.prismaService.canvasLTIConfiguration.update({
      where: { idPJ: idPJ },
      data: {
        canvasClientIdLTI: dto.canvasClientIdLTI,
        canvasClientIdDevKey: dto.canvasClientIdDevKey,
        canvasClientSecretDevKey: dto.canvasClientSecretDevKey,
        canvasDomain: dto.canvasDomain,
        iv: dto.iv,
      },
      select: ConfigWithoutSecrets,
    });
  }

  async createLoginIntent(state: string, ltiConfigurationId: string, ltiLaunchInfo: LTILaunchInfo) {
    return this.prismaService.canvasLoginIntents.create({
      data: {
        state,
        canvasLTIConfigurationId: ltiConfigurationId,
        ltiLaunchInfo: JSON.parse(JSON.stringify(ltiLaunchInfo)),
      },
    });
  }

  async getLoginIntent(state: string) {
    return this.prismaService.canvasLoginIntents.findFirst({
      where: { state },
    });
  }

  async getToken(userId: string, canvasDomain: string) {
    return await this.prismaService.canvasToken.findFirst({
      where: {
        canvasUserId: Number(userId),
        canvasDomain: canvasDomain,
      },
    });
  }

  async saveToken(canvasAuthResponse: ICanvasAuthResponse, canvasDomain: string) {
    const tokenExpiration = new Date(Date.now() + canvasAuthResponse.expires_in * 1000);
    return await this.prismaService.canvasToken.create({
      data: {
        canvasDomain: canvasDomain,
        canvasUserId: canvasAuthResponse.user.id,
        token: canvasAuthResponse.access_token,
        refreshToken: canvasAuthResponse.refresh_token,
        tokenExpiration: tokenExpiration,
      },
    });
  }

  async updateToken(canvasAuthResponse: Partial<ICanvasAuthResponse>, canvasDomain: string) {
    return await this.prismaService.canvasToken.update({
      where: {
        canvasUserId_canvasDomain: {
          canvasUserId: canvasAuthResponse.user.id,
          canvasDomain: canvasDomain,
        },
      },
      data: {
        token: canvasAuthResponse.access_token,
        tokenExpiration: new Date(Date.now() + canvasAuthResponse.expires_in * 1000),
      },
    });
  }

  async createCanvasUsers(data: ICreateCanvasUsers[]) {
    return await this.prismaService.canvasUser.createMany({
      data: data.map((user) => ({
        canvasUserId: user.canvasUserId,
        canvasName: user.name,
        canvasEmail: user.email,
        canvasDomain: user.domain,
        tempDocument: user.documentNumber,
        isTeacher: user.isTeacher,
      })),
      skipDuplicates: true,
    });
  }
}
