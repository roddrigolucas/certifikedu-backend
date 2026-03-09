import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { CertificateStatus, User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AbilitiesService } from '../../abilities/abilities.service';
import { AuxService } from '../../aux/aux.service';
import { CertificatesService } from '../../certificates/certificates.service';
import { TCertificatesCreateInput } from '../../certificates/types/certificates.types';
import { SchoolsService } from '../../schools/schools.service';
import { UsersService } from '../../users/users.service';
import { GetUser } from '../../auth/decorators';
import { DateFormat } from '../../interceptors/dateformat.interceptor';
import { CreateNewCertificateAPIDto } from '../dtos/certificates/certificates-input.dto';
import { ResponseCertificatesAPIDto } from '../dtos/certificates/certificates-response.dto';
import { ApiKeyGuard } from '../guards/api_secret.guard';

@ApiTags('API Certificates')
@Controller('api/v1')
@UseGuards(ApiKeyGuard)
export class CertificatesAPIController {
  constructor(
    private readonly certificateService: CertificatesService,
    private readonly usersService: UsersService,
    private readonly auxService: AuxService,
    private readonly schoolsService: SchoolsService,
    private readonly abilitiesService: AbilitiesService,
  ) {}

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'evidences', maxCount: 10 },
      { name: 'narrative', maxCount: 1 },
    ]),
  )
  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt', 'createdAt', 'updatedAt']))
  @Post('certificate')
  async createCertificateAPI(
    @GetUser() user: User,
    @UploadedFiles() files: { evidences?: Array<Express.Multer.File>; narrative?: Array<Express.Multer.File> },
    @Body() certificateInfo: CreateNewCertificateAPIDto,
  ): Promise<ResponseCertificatesAPIDto> {
    try {
      if (Number.isNaN(parseInt(certificateInfo.hoursWorkload))) {
        throw new Error();
      }
    } catch {
      throw new BadRequestException('workload not valid');
    }

    const schoolInfo = await this.schoolsService.getSchoolByCnpj(certificateInfo.schoolCnpj);

    if (!schoolInfo) {
      throw new NotFoundException(`School ${certificateInfo.schoolCnpj} not found.`);
    }

    const pj = await this.auxService.getPjInfo(user.id);

    if (schoolInfo.ownerUserId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this school.');
    }

    const receptorInfo = await this.usersService.getPfUserByDocument(certificateInfo.receptorDoc);

    if (!receptorInfo) {
      throw new NotFoundException(`User with document ${certificateInfo.receptorDoc} not found.`);
    }

    const certificateId = randomUUID();

    const creatableCertificate: TCertificatesCreateInput = {
      certificateId: certificateId,
      user: { connect: { id: user.id } },
      emissorName: pj.nomeFantasia,
      receptorId: receptorInfo.id,
      receptorName: receptorInfo.pessoaFisica.nome,
      receptorEmail: receptorInfo.email,
      receptorDoc: certificateInfo.receptorDoc,
      name: certificateInfo.name,
      cargaHoraria: parseInt(certificateInfo.hoursWorkload) * 60,
      status: CertificateStatus.ENABLED,
      description: certificateInfo.description,
      paymentType: 'api',
      school: { connect: { schoolId: schoolInfo.schoolId } },
    };

    if (certificateInfo?.issuedAt) {
      const emittedAt = this.auxService.formatDate(certificateInfo.issuedAt);
      creatableCertificate.issuedAt = emittedAt;
    }

    if (certificateInfo?.expiresAt) {
      const expiresAt = this.auxService.formatDate(certificateInfo.expiresAt);
      creatableCertificate.expiresAt = expiresAt;
    }

    const abilitiesPromises: Array<Promise<string>> = certificateInfo.abilities.map(async (ability) => {
      return await this.abilitiesService.createNewAbilityFromCertificate(user.id, {
        category: ability.category,
        ability: ability.ability,
      });
    });

    const abilitiesIds = await Promise.all(abilitiesPromises);

    if (abilitiesIds.length === 0) {
      throw new BadRequestException('No abilities to include');
    }

    creatableCertificate.habilidades = {
      create: abilitiesIds.map((abilityId) => {
        return { userId: receptorInfo.id, habilidadeId: abilityId };
      }),
    };

    await this.certificateService.createAPICertificate(creatableCertificate, schoolInfo);

    if (files?.evidences) {
      await this.certificateService.createEvidencesOnCertificate(user.id, certificateId, files.evidences);
    }

    if (files?.narrative) {
      await this.certificateService.createNarrativesOnCertificate(user.id, certificateId, files.narrative);
    }

    const certificate = await this.certificateService.getCertificatesWithEvidencesAndNarrativeById(certificateId);

    return {
      certificateId: certificate.certificateId,
      receptorDoc: certificate.receptorDoc,
      name: certificate.name,
      description: certificate.description,
      hoursWorkload: certificate.cargaHoraria / 60,
      issuedAt: certificate.issuedAt,
      expiresAt: certificate.expiresAt,
      abilities: certificate.habilidades.map((ability) => ({
        ability: ability.habilidade.habilidade,
        category: ability.habilidade.tema,
      })),
      schoolCnpj: certificate.school.schoolCnpj,
      schoolName: certificate.school.name,
      blockchain: certificate.blockchain,
      openBadge: certificate.openBadge,
      evidences: certificate.evidence.map((evidence) => {
        return {
          createdAt: evidence.createdAt,
          updatedAt: evidence.updatedAt,
          evidenceUrl: '',
          evidenceType: evidence.evidenceType,
        };
      }),
      narrative: certificate.narrative.map((narrative) => {
        return {
          createdAt: narrative.createdAt,
          updatedAt: narrative.updatedAt,
          narrativeUrl: '',
          narrativeType: narrative.narrativeType,
        };
      }),
    };
  }

  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt', 'createdAt', 'updatedAt']))
  @Get('certificates/:cpf')
  async getUserCertificatesAPI(
    @GetUser('id') userId: string,
    @Param('cpf') cpf: string,
  ): Promise<Array<ResponseCertificatesAPIDto>> {
    const pj = await this.auxService.getPjInfo(userId);

    const userPf = await this.usersService.getUserPfByDocumentWithSchools(cpf);

    if (!userPf || !userPf?.pessoaFisica) {
      throw new NotFoundException('User not found');
    }

    const schools = userPf.pessoaFisica.schools.map((school) => {
      return school.ownerUserId;
    });

    if (!schools.includes(pj.idPJ)) {
      throw new ForbiddenException('This CPF is not a student in this users schools');
    }

    const certificates = await this.certificateService.getCertificatesWithEvidencesAndNarrativeByCpf(cpf);

    return certificates
      .filter((certificate) => certificate.school.ownerUserId === pj.idPJ)
      .map((certificate) => {
        return {
          certificateId: certificate.certificateId,
          receptorDoc: certificate.receptorDoc,
          name: certificate.name,
          description: certificate.description,
          hoursWorkload: certificate.cargaHoraria / 60,
          issuedAt: certificate.issuedAt,
          expiresAt: certificate.expiresAt,
          abilities: certificate.habilidades.map((ability) => {
            return {
              category: ability.habilidade.tema,
              ability: ability.habilidade.habilidade,
            };
          }),
          schoolCnpj: certificate.school.schoolCnpj,
          schoolName: certificate.school.name,
          blockchain: certificate.blockchain,
          openBadge: certificate.openBadge,
          evidences: certificate.evidence.map((evidence) => {
            return {
              createdAt: evidence.createdAt,
              updatedAt: evidence.updatedAt,
              evidenceType: evidence.evidenceType,
              evidenceUrl: evidence.evidenceUrl,
            };
          }),
          narrative: certificate.narrative.map((narrative) => {
            return {
              createdAt: narrative.createdAt,
              updatedAt: narrative.updatedAt,
              narrativeUrl: narrative.narrativeUrl,
            };
          }),
        };
      });
  }

  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt', 'createdAt', 'updatedAt']))
  @Get('school/certificates/:cnpj')
  async getSchoolCertificatesAPI(
    @GetUser('id') userId: string,
    @Param('cnpj') cnpj: string,
  ): Promise<Array<ResponseCertificatesAPIDto>> {
    const pj = await this.auxService.getPjInfo(userId);

    const school = await this.schoolsService.getSchoolByCnpj(cnpj);

    if (school.ownerUserId !== pj.idPJ) {
      throw new ForbiddenException('this user does not own this school');
    }

    const certificates = await this.certificateService.getCertificatesBySchoolId(school.schoolId);

    return certificates.map((certificate) => {
      return {
        certificateId: certificate.certificateId,
        receptorDoc: certificate.receptorDoc,
        name: certificate.name,
        description: certificate.description,
        hoursWorkload: certificate.cargaHoraria / 60,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        abilities: certificate.habilidades.map((ability) => {
          return {
            category: ability.habilidade.tema,
            ability: ability.habilidade.habilidade,
          };
        }),
        schoolCnpj: certificate.school.schoolCnpj,
        schoolName: certificate.school.name,
        blockchain: certificate.blockchain,
        openBadge: certificate.openBadge,
        evidences: certificate.evidence.map((evidence) => {
          return {
            createdAt: evidence.createdAt,
            updatedAt: evidence.updatedAt,
            evidenceType: evidence.evidenceType,
            evidenceUrl: evidence.evidenceUrl,
          };
        }),
        narrative: certificate.narrative.map((narrative) => {
          return {
            createdAt: narrative.createdAt,
            updatedAt: narrative.updatedAt,
            narrativeUrl: narrative.narrativeUrl,
          };
        }),
      };
    });
  }
}
