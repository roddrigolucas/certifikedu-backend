import { Get, Controller, Param, UseInterceptors, NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';
import { DateFormat } from './interceptors/dateformat.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { AuxService } from './_aux/_aux.service';

@ApiTags('public')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly auxService: AuxService,
  ) {}

  @Get()
  root(): string {
    return 'YEP!!';
  }

  @Get('/public/:hash')
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt', 'issuedAt', 'expiresAt']))
  async getCertificateByHash(@Param('hash') hash: string) {
    const certificateShare = await this.appService.getCertificateByHash(hash);

    if (!certificateShare) {
      throw new NotFoundException('Certificate not found');
    }

    const certificate = await this.appService.getCertificateInfoById(certificateShare.certificateId);

    const response = {
      certificateId: certificate.certificateId,
      receptorDoc: certificate.receptorDoc,
      name: certificate.name,
      issuerName: certificate.emissorName,
      receptorName: certificate.receptorName,
      description: certificate.description,
      status: certificate.status,
      statusRequest: certificate.statusRequest,
      certificatePicture: certificate.certificatePicture,
      openBadgePicture: certificate.openBadge
        ? this.auxService.getOpenBadgePicturePath(
            certificate.emissorId,
            certificate.certificateId,
            certificate.certificatePicture.split('.').at(-1),
            certificate.openBadgeModel.version,
          )
        : null,
      hoursWorkload: certificate.cargaHoraria / 60,
      abilities: certificate.habilidades.map((habilidade) => {
        return {
          category: habilidade.habilidade.tema,
          ability: habilidade.habilidade.habilidade,
        };
      }),
      certificateHash: certificate.hashes[0]?.certificateHash ?? '',
      blockchain: certificate.blockchain,
      openBadge: certificate.openBadge,
      issuedAt: certificate.issuedAt ?? certificate.createdAt,
      expiresAt: certificate.expiresAt || null,
      evidences: certificate.evidence.map((evidence) => {
        return {
          createdAt: evidence.createdAt,
          updatedAt: evidence.updatedAt,
          evidenceType: evidence.evidenceType,
          evidenceUrl: evidence.evidenceUrl,
        };
      }),
    };

    if (certificate.templateId) {
      const pathId = await this.appService.checkCertificateLearningPath(certificate.templateId);
      if (pathId) {
        response['pathInfo'] = await this.appService.getLearningPathInformation(pathId);
      }
    }

    if (certificate.template?.inverseImages?.imageUrl) {
      response['inverseUrl'] = certificate.template.inverseImages.imageUrl;
    }

    return response;
  }

  @Get('/public/email/:email/document/:document')
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt', 'issuedAt', 'expiresAt']))
  async checkUserByEmailAndCpf(
    @Param('email') email: string,
    @Param('document') document: string,
  ): Promise<{ hasAccount: boolean }> {
    return this.appService.checkUserByEmailAndCpf(email, document);
  }
}
