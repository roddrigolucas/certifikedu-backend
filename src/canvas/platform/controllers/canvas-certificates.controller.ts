import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CertificatesService } from '../../../certificates/certificates.service';
import { DateFormat } from '../../../interceptors/dateformat.interceptor';
import { CanvasGetUser } from '../decorators/get-user-canvas.decorator';
import {
  ResponseCanvasCertificatesDto,
  ResponseCanvasPlatformAdaptedCertificatesInfoDto,
} from '../dtos/certificates/canvas-certificates-response.dto';
import { CanvasJwtGuard } from '../guards/canvas-jwk.guard';

@ApiTags('Canvas Platform -- Certificates')
@Controller('canvas-platform')
@UseGuards(CanvasJwtGuard)
export class CanvasCertificatesController {
  constructor(private readonly certificateService: CertificatesService) {}

  @Get('/certificates')
  async getCanvasCertificates(
    @CanvasGetUser('courseId') courseId: string,
  ): Promise<ResponseCanvasPlatformAdaptedCertificatesInfoDto> {
    const certificates = await this.certificateService.getCertificatesByCourseId(courseId);

    return {
      data: {
        certificateInfo: certificates.map((certificate) => {
          return {
            certificateId: certificate.certificateId,
            certificateName: certificate.name,
            certificateDescription: certificate.description,
            certificateAbilities: certificate.habilidades.map((habilidade) => {
              return {
                abilityId: habilidade.habilidadeId,
                ability: habilidade.habilidade.habilidade,
                category: habilidade.habilidade.tema,
              };
            }),
            certificateIssuer: certificate.emissorName,
            certificateReceptor: certificate?.receptorName ?? '',
            certificateCreatedAt: certificate?.issuedAt ?? certificate.createdAt,
            status: certificate.status,
          };
        }),
      },
    };
  }

  @UseInterceptors(new DateFormat(['certificateCreatedAt', 'issuedAt']))
  @Get('/certificates/:certificateId')
  async certificateInfoById(
    @CanvasGetUser('userId') userId: string,
    @Param('certificateId') certificateId: string,
  ): Promise<ResponseCanvasCertificatesDto> {
    const certificate = await this.certificateService.getCertificateById(certificateId);

    if (!certificate) {
      throw new NotFoundException('Certificate not Found');
    }

    if (certificate.emissorId !== userId) {
      throw new ForbiddenException('Certificate not emmited by user');
    }

    return {
      certificateId: certificate.certificateId,
      receptorDoc: certificate.receptorDoc,
      name: certificate.name,
      issuerName: certificate.emissorName,
      receptorName: certificate.receptorName,
      description: certificate.description,
      status: certificate.status,
      statusRequest: certificate.statusRequest,
      hoursWorkload: certificate.cargaHoraria,
      abilities: certificate.habilidades.map((habilidade) => {
        return {
          abilityId: habilidade.habilidadeId,
          category: habilidade.habilidade.tema,
          ability: habilidade.habilidade.habilidade,
        };
      }),
      certificateHash: certificate.hashes[0]?.certificateHash ?? '',
      blockchain: certificate.blockchain,
      openBadge: certificate.openBadge,
      issuedAt: certificate.issuedAt ?? certificate.createdAt,
      expiresAt: certificate.expiresAt || null,
    };
  }
}
