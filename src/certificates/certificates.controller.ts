import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators';
import { Roles } from '../users/decorators';
import { RolesGuard } from '../users/guards';
import { JwtGuard } from '../auth/guard';
import { CertificatesService } from './certificates.service';
import { CertificateStatus, CertificateSuccessStatus, User } from '@prisma/client';
import { DateFormat } from '../interceptors/dateformat.interceptor';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { SESService } from '../aws/ses/ses.service';
import { FontsService } from 'src/fonts/fonts.service';
import { AuxService } from '../aux/aux.service';
import { AbilitiesService } from '../abilities/abilities.service';
import { SecretManagerService } from '../aws/secrets-manager/secrets-manager.service';
import { PaymentsService } from '../payments/services/payments.service';
import {
  CertificatesPaginationQueryDto,
  CreateCertificateDto,
  SQSLambdaRequestDto,
} from './dtos/certificates-input.dto';
import {
  ResponseCertificateDto,
  ResponseSuccessCertificatesDto,
  ResponseUserLastCertificatesDto,
} from './dtos/certificates-response.dto';
import { IUserCertificatePaymentInfo, PaymentType } from 'src/payments/interfaces/payments.interfaces';

@ApiTags('PF -- Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(
    private readonly certificateService: CertificatesService,
    private readonly auxService: AuxService,
    private readonly fontsService: FontsService,
    private readonly abilitiesService: AbilitiesService,
    private readonly paymentsService: PaymentsService,
    private readonly sesService: SESService,
    private readonly smsService: SecretManagerService,
  ) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'evidences', maxCount: 10 }]))
  @Post('create')
  async createUserCertificate(
    @GetUser() user: User,
    @Body() dto: CreateCertificateDto,
    @UploadedFiles() files?: { evidences?: Array<Express.Multer.File> },
  ): Promise<ResponseCertificateDto> {
    let userCredits: IUserCertificatePaymentInfo;
    if (user.freeCertificates) {
      userCredits = {
        isValid: true,
        type: PaymentType.none,
        id: '',
        next_date: new Date(),
      };
    } else {
      userCredits = await this.paymentsService.checkUserPfCertificatePayment(user.id);
    }

    if (!userCredits.isValid) {
      throw new UnauthorizedException({
        message: 'This user has no available credits for this action',
        type: userCredits.type,
        nextAvailableDate: userCredits.next_date,
      });
    }

    const validAbilityIds = await this.abilitiesService.getValidAbilitiesIdsByNameOrId(dto.habilidades);

    if (validAbilityIds.length === 0) {
      throw new BadRequestException('No valid abilities.');
    }

    const pf = await this.auxService.getPfInfo(user.id);

    if (!pf) {
      throw new BadRequestException('User must be PF');
    }

    const certificateData = await this.certificateService.getSelfEmmitedCertificatePaymentType(userCredits, {
      user: { connect: { id: user.id } },
      emissorName: pf.nome,
      receptorId: user.id,
      receptorName: pf.nome,
      receptorEmail: pf.email,
      receptorDoc: user.numeroDocumento,
      name: dto.name,
      statedIssuer: dto.statedIssuer,
      statedIssuerDocument: dto.statedIssuerDocument,
      statedIssuerUrl: dto.statedIssuerUrl,
      descriptionImage: dto.descriptionImage,
      issuedAt: dto?.issuedAt ? this.auxService.formatDate(dto.issuedAt) : new Date(),
      cargaHoraria: dto.cargaHoraria * 60,
      status: CertificateStatus.REVIEW,
      description: dto.description,
      paymentType: userCredits.type,
      successStatus: CertificateSuccessStatus.SUCCESS,
      habilidades: {
        create: validAbilityIds.map((abilityId) => {
          return {
            habilidadeId: abilityId,
            userId: user.id,
          };
        }),
      },
    });

    if (dto?.fontIdDesc) {
      const fontId = await this.fontsService.getFontUrlById(dto.fontIdDesc);

      if (!fontId) {
        throw new NotFoundException('Font not Found');
      }

      certificateData.fontDesc = { connect: { fontId: dto.fontIdDesc } };
    }

    if (dto?.fontIdName) {
      const fontId = await this.fontsService.getFontUrlById(dto.fontIdName);

      if (!fontId) {
        throw new NotFoundException('Font not Found');
      }

      certificateData.fontName = { connect: { fontId: dto.fontIdName } };
    }

    const certificate = await this.certificateService.createSelfEmmitedCertificate(certificateData);

    if (files?.evidences) {
      await this.certificateService.createEvidencesOnCertificate(user.id, certificate.certificateId, files.evidences);
    }

    return {
      certificateId: certificate.certificateId,
      receptorDoc: certificate.receptorId,
      name: certificate.name,
      description: certificate.description,
      hoursWorkload: certificate.cargaHoraria / 60,
      receptorName: certificate.receptorName,
      issuerName: certificate.emissorName,
      abilities: certificate.habilidades.map((ability) => {
        return {
          ability: ability.habilidade.habilidade,
          abilityId: ability.habilidade.habilidadeId,
          category: ability.habilidade.tema,
        };
      }),
      blockchain: certificate.blockchain,
      openBadge: certificate.openBadge,
      issuedAt: certificate?.issuedAt ?? certificate.createdAt,
      expiresAt: certificate?.expiresAt,
      statedIssuer: certificate.statedIssuer,
      status: certificate.status,
      statusRequest: certificate.statusRequest,
      certificateHash: certificate?.hashes?.at(0)?.certificateHash ?? null,
      evidences: (await this.certificateService.getCertificatesEvidences(certificate.certificateId)).map((evidence) => {
        return {
          evidenceId: evidence.id,
          createdAt: evidence.createdAt,
          updatedAt: evidence.updatedAt,
          evidenceType: evidence.evidenceType,
          evidenceUrl: evidence.evidenceUrl,
        };
      }),
    };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('review')
  @UseInterceptors(new DateFormat(['certificateCreatedAt']))
  @Get('page')
  async getCertificatesInfoPag(
    @GetUser('id') userId: string,
    @Query() paginationQuery: CertificatesPaginationQueryDto,
  ): Promise<ResponseSuccessCertificatesDto> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const certificates = await this.certificateService.getUserCertificatesByIdPaginated(userId, limit, skip);

    const hasNextPage: boolean = certificates.length > limit;

    if (hasNextPage) {
      certificates.pop();
    }

    return {
      data: {
        hasNextPage: hasNextPage,
        certificateInfo: await Promise.all(
          certificates.map(async (certificate) => {
            return {
              certificateId: certificate.certificateId,
              certificateName: certificate.name,
              certificateDescription: certificate.description,
              certificateAbilities: certificate.habilidades.map((ability) => {
                return {
                  ability: ability.habilidade.habilidade,
                  category: ability.habilidade.tema,
                };
              }),
              certificateIssuer: certificate.emissorName,
              statedIssuer: certificate.statedIssuer,
              status: certificate.status,
              certificateCreatedAt: certificate.issuedAt ?? certificate.createdAt,
              evidences: await this.certificateService.getCertificatesEvidencesCount(certificate.certificateId),
            };
          }),
        ),
      },
    };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('review')
  @Get('user/last-certificates')
  @UseInterceptors(new DateFormat(['createdAt']))
  async getLastUserCertificates(@GetUser('id') userId: string): Promise<ResponseUserLastCertificatesDto> {
    const certificates = await this.certificateService.getUserLastCertificates(userId);

    return {
      certificates: await Promise.all(
        certificates.map(async (certificate) => {
          return {
            certificateId: certificate.certificateId,
            name: certificate.name,
            abilities: certificate.habilidades.map((ability) => {
              return {
                ability: ability.habilidade.habilidade,
                category: ability.habilidade.tema,
              };
            }),
            issuer: certificate.emissorName,
            statedIssuer: certificate.statedIssuer,
            createdAt: certificate.createdAt.toString(),
            evidences: await this.certificateService.getCertificatesEvidencesCount(certificate.certificateId),
          };
        }),
      ),
    };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt', 'issuedAt', 'expiresAt']))
  @Roles('review')
  @Get('info/:id')
  async getCertificateInfoById(
    @GetUser('id') userId: string,
    @Param('id') certificateId: string,
  ): Promise<ResponseCertificateDto> {
    const certificate = await this.certificateService.getCertificateById(certificateId);

    if (!certificate) {
      throw new NotFoundException('certificate not found');
    }

    if (certificate.status === 'DISABLED') {
      throw new ForbiddenException('certificado esta desativado');
    }

    if (certificate.receptorId != userId && certificate.emissorId != userId) {
      throw new ForbiddenException('This user does not own this certificate');
    }

    return {
      certificateId: certificate.certificateId,
      receptorDoc: certificate.receptorDoc,
      name: certificate.name,
      description: certificate.description,
      hoursWorkload: certificate.cargaHoraria / 60,
      receptorName: certificate.receptorName,
      issuerName: certificate.emissorName,
      abilities: certificate.habilidades.map((ability) => {
        return {
          ability: ability.habilidade.habilidade,
          abilityId: ability.habilidade.habilidadeId,
          category: ability.habilidade.tema,
        };
      }),
      blockchain: certificate.blockchain,
      openBadge: certificate.openBadge,
      issuedAt: certificate?.issuedAt ?? certificate.createdAt,
      statedIssuer: certificate.statedIssuer,
      expiresAt: certificate?.expiresAt,
      status: certificate.status,
      statusRequest: certificate.statusRequest,
      certificateHash: certificate?.hashes?.at(0)?.certificateHash ?? null,
      evidences: (await this.certificateService.getCertificatesEvidences(certificate.certificateId)).map((evidence) => {
        return {
          evidenceId: evidence.id,
          createdAt: evidence.createdAt,
          updatedAt: evidence.updatedAt,
          evidenceType: evidence.evidenceType,
          evidenceUrl: evidence.evidenceUrl,
        };
      }),
    };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Patch('/public/disable/:certificateId')
  async disableCertificateHash(
    @GetUser('id') userId: string,
    @Param('certificateId') certificateId: string,
  ): Promise<{ success: true }> {
    const certificate = await this.certificateService.getCertificateById(certificateId);

    if (certificate.receptorId !== userId) {
      throw new ForbiddenException('This user is not the owner of this certificate');
    }

    await this.certificateService.disableCertificateHashes(certificateId);

    return { success: true };
  }

  @Roles('enabled')
  @UseGuards(JwtGuard, RolesGuard)
  @Get('certificate/approval/:id')
  async requestCertificateApproval(
    @GetUser('id') userId: string,
    @GetUser('email') userEmail: string,
    @Param('id') certificateId: string,
  ): Promise<{ success: true }> {
    const certificate = await this.certificateService.getCertificateById(certificateId);

    if (certificate.receptorId !== userId) {
      throw new ForbiddenException('This user is not the owner of this certificate');
    }

    await this.certificateService.updateCertificateRecord(certificateId, { statusRequest: true });

    await this.sesService.sendNewUserRequestCertificateAdmin(userEmail, certificateId);

    return { success: true };
  }

  @ApiExcludeEndpoint()
  @Post('/sqsLambda')
  async receiveDoneSQSLambda(@Body() data: SQSLambdaRequestDto) {
    const secret = await this.smsService.getSecretFromKey('lambdaRequestSecret');

    if (data.sqs_secret !== secret) {
      throw new InternalServerErrorException({
        message: 'Key from sqs lambda is not valid',
        ...data,
      });
    }

    const certificateShare = await this.certificateService.getCertificateShareByHash(data.hash);

    if (!certificateShare) throw new NotFoundException('Certificate not found');

    if (data.openBadgeSuccess) {
      const openBadgeData = await this.certificateService.getOpenBadgeJsonsPaths(certificateShare.certificateId);

      await this.certificateService.updateCertificateRecord(certificateShare.certificateId, {
        successStatus: CertificateSuccessStatus.SUCCESS,
        openBadge: true,
        openBadgeModel: {
          create: openBadgeData,
        },
      });
    }

    return { success: true };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('review')
  @Post('evidences/:certificateId')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'evidences', maxCount: 10 }]))
  @UseInterceptors(new DateFormat(['createdAt']))
  async addEvidenceToCertificate(
    @GetUser('id') userId: string,
    @Param('certificateId') certificateId: string,
    @UploadedFiles() files?: { evidences?: Array<Express.Multer.File> },
  ): Promise<{ success: boolean }> {
    const certificate = await this.certificateService.getCertificateById(certificateId);

    if (!certificate) {
      throw new NotFoundException('Certificate not found.');
    }

    if (certificate?.receptorId !== userId) {
      throw new ForbiddenException('This user is not the receptor of this certificate');
    }

    await this.certificateService.createEvidencesOnCertificate(userId, certificateId, files.evidences);

    return { success: true };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('review')
  @Delete('evidences/:evidenceId')
  @UseInterceptors(new DateFormat(['createdAt']))
  async deleteEvidenceFromCertificate(
    @GetUser('id') userId: string,
    @Param('evidenceId') evidenceId: string,
  ): Promise<{ success: boolean }> {
    const evidence = await this.certificateService.getCertificateEvidenceById(evidenceId);

    if (!evidence) {
      throw new NotFoundException('Evidence not found.');
    }

    if (evidence.certificate.receptorId !== userId) {
      throw new NotFoundException('This user is not the receptor of this certificate.');
    }

    await this.certificateService.deleteEvidenceFromCertificate(evidenceId);

    return { success: true };
  }
}
