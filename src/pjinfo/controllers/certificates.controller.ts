import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DateFormat } from '../../interceptors/dateformat.interceptor';
import { GetUser } from '../../auth/decorators';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { PJRoles } from '../decorators/roles-pj.decorator';
import { PJRolesGuard } from '../guards/roles-guards-pj.guard';
import { CertificatesService } from '../../certificates/certificates.service';
import { AuxService } from '../../aux/aux.service';
import { TemplatesService } from '../../templates/templates.service';
import { CoursesService } from '../../courses/courses.service';
import { UsersService } from '../../users/users.service';
import {
  CertificateEventDetailsResponseDto,
  CertificateEmissionListResponseDto,
  ResponseCertificatePjInfoDto,
  ResponseSuccessCertificatesPjInfoDto,
} from '../dtos/certificates/certificates-response.dto';
import {
  CertificatesPagQueryPjInfoDto,
  CreateTemplatedCertificatesPjInfoDto,
} from '../dtos/certificates/certificates-input.dto';
import { randomUUID } from 'crypto';

@ApiTags('Institutional -- Certificates')
@Controller('pj/:pjId')
@UseGuards(JwtGuard)
export class CertificatesInstitutionalController {
  constructor(
    private readonly certificateService: CertificatesService,
    private readonly templateService: TemplatesService,
    private readonly courseService: CoursesService,
    private readonly usersService: UsersService,
    private readonly auxService: AuxService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('review')
  @PJRoles('basico')
  @UseInterceptors(new DateFormat(['certificateCreatedAt', 'issuedAt']))
  @Get('/certificates/info/:certificateId')
  async certificateInfoById(
    @GetUser('id') userId: string,
    @Param('certificateId') certificateId: string,
  ): Promise<ResponseCertificatePjInfoDto> {
    const certificate = await this.certificateService.getCertificateById(certificateId);

    if (!certificate) {
      throw new NotFoundException('certificate not found');
    }

    if (certificate.status === 'DISABLED') {
      throw new ForbiddenException('Certificado is disabled');
    }

    if (certificate.receptorId != userId && certificate.emissorId != userId) {
      throw new ForbiddenException('This user does not own this certificate');
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
      status: certificate.status,
      statusRequest: certificate.statusRequest,
      certificateHash: certificate?.hashes.at(0).certificateHash ?? null,
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('review')
  @PJRoles('basico')
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt', 'issuedAt', 'expiresAt', 'certificateCreatedAt']))
  @Get('/certificates/page')
  async certificateInfo(
    @GetUser('id') userId: string,
    @Query() pagDto: CertificatesPagQueryPjInfoDto,
  ): Promise<ResponseSuccessCertificatesPjInfoDto> {
    const { page = 1, limit = 10 } = pagDto;
    const skip = (page - 1) * limit;

    const certificates = await this.certificateService.getUserCertificatesByIdPaginated(userId, limit, skip);

    const hasNextPage: boolean = certificates.length > limit;

    if (hasNextPage) {
      certificates.pop();
    }

    return {
      data: {
        hasNextPage: hasNextPage,
        certificateInfo: certificates.map((certificate) => {
          return {
            certificateId: certificate.certificateId,
            certificateName: certificate.name,
            certificateDescription: certificate.description,
            certificateReceptor: certificate.receptorName ?? 'O usuário ainda não finalizou o cadastro',
            certificateAbilities: certificate.habilidades.map((ability) => {
              return {
                ability: ability.habilidade.habilidade,
                category: ability.habilidade.tema,
              };
            }),
            certificateIssuer: certificate.emissorName,
            status: certificate.status,
            certificateCreatedAt: certificate.issuedAt ?? certificate.createdAt,
            successStatus: certificate.successStatus,
          };
        }),
      },
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt']))
  @Post('/template/:templateId/course/:courseId/certificates')
  async createTemplateCertificateToCourse(
    @GetUser('id') userId: string,
    @Param('templateId') templateId: string,
    @Param('courseId') courseId: string,
  ): Promise<{ success: boolean }> {
    const templateData = await this.templateService.getTemplateById(templateId);

    if (!templateData) {
      throw new NotFoundException('Template Not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (templateData.school.ownerUserId !== pj.idPJ) {
      throw new ForbiddenException('This user does not own this template');
    }

    const courseData = await this.courseService.getCourseById(courseId);

    if (!templateData.courses.map((course) => course.courseId).includes(courseData.courseId)) {
      throw new ForbiddenException('This template is not associated with this course');
    }

    const emissionId = randomUUID();
    const students = await this.usersService.getAllCoursesStudents([courseId]);

    students.map(async (student) => {
      const studentInfo = {
        templateId: templateId,
        docNumber: student.numeroDocumento,
        email: student.email,
        name: student?.pessoaFisica?.nome ?? student?.tempName ?? '',
      };

      await this.certificateService.issueCertificateFromTemplate(studentInfo, templateData, emissionId);
    });

    return { success: true };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt']))
  @Post('/template/:templateId/school/certificates')
  async createTemplateCertificateToSchool(
    @GetUser('id') userId: string,
    @Param('templateId') templateId: string,
  ): Promise<{ success: boolean }> {
    const templateData = await this.templateService.getTemplateById(templateId);

    if (!templateData) {
      throw new NotFoundException('Template Not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (templateData.school.ownerUserId !== pj.idPJ) {
      throw new ForbiddenException('This user does not own this template');
    }

    const students = await this.usersService.getAllSchoolsStudents([templateData.schoolId]);

    const emissionId = randomUUID();

    students.map(async (student) => {
      const studentInfo = {
        templateId: templateId,
        docNumber: student.numeroDocumento,
        email: student.email,
        name: student?.pessoaFisica?.nome ?? student?.tempName ?? '',
      };

      await this.certificateService.issueCertificateFromTemplate(studentInfo, templateData, emissionId);
    });

    return { success: true };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Post('template/:templateId/certificates')
  async createCertificatesFromTemplate(
    @GetUser('id') userId: string,
    @Param('templateId') templateId: string,
    @Body() dto: CreateTemplatedCertificatesPjInfoDto,
  ): Promise<{ success: boolean }> {
    const templateData = await this.templateService.getTemplateById(templateId);

    if (!templateData) {
      throw new NotFoundException('Template Not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (templateData.school.ownerUserId !== pj.idPJ) {
      throw new ForbiddenException('This user does not own this template');
    }

    const students = await this.usersService.getUsersPfByDocumentNumbers(dto.cpfs);

    const emissionId = randomUUID();

    students.map(async (student) => {
      const studentInfo = {
        templateId: templateId,
        docNumber: student.numeroDocumento,
        email: student.email,
        name: student?.pessoaFisica?.nome ?? student?.tempName ?? '',
      };

      await this.certificateService.issueCertificateFromTemplate(studentInfo, templateData, emissionId);
    });

    return { success: true };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('certificates/emissions')
  async listEmissions(
    @GetUser('id') userId: string,
  ): Promise<CertificateEmissionListResponseDto> {
    const result = await this.certificateService.listCertificateGroupedEvents(userId);

    return { response: { data: [...result.eventsInfo] } };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('certificates/emissions/:emissionId')
  async getCertificateEmissionDetails(
    @Param('emissionId') emissionId: string,
  ): Promise<CertificateEventDetailsResponseDto> {
    const result = await this.certificateService.getCertificateEventDetails(emissionId);

    if (result.events.length === 0) {
      throw new NotFoundException('Template emission not found');
    }

    const firstEvent = result.events[0];
    return {
      emissionId,
      templateId: firstEvent.template.templateId,
      templateName: firstEvent.template.name,
      receptors: [...result.receptorsInfo.existingUsers, ...result.receptorsInfo.nonExistingUsers],
      emissor: {
        document: firstEvent.emissorDoc,
        name: firstEvent.emissorName,
        email: firstEvent.emissorEmail,
      },
      courseName: firstEvent.template.courses[0].course.name,
      schoolName: firstEvent.school.name,
      receptorsFailedQuantity: result.events.filter((event) => event.successStatus === 'FAILED').length,
      receptorsSucceededQuantity: result.events.filter((event) => event.successStatus === 'SUCCESS').length,
      receptorsPendingQuantity: result.events.filter((event) => event.successStatus === 'PENDING').length,
      createdAt: firstEvent.createdAt,
    };
  }
}
