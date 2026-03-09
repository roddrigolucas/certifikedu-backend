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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SchoolsService } from '../../../schools/schools.service';
import { TemplatesService } from '../../../templates/templates.service';
import { BackgroundsService } from '../../../backgrounds/background.service';
import { CertificatesService } from '../../../certificates/certificates.service';
import { CoursesService } from '../../../courses/courses.service';
import { AuxService } from '../../../aux/aux.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { DateFormat } from '../../../interceptors/dateformat.interceptor';
import { UsersService } from '../../../users/users.service';
import { CanvasGetUser } from '../decorators/get-user-canvas.decorator';
import { CanvasJwtGuard } from '../guards/canvas-jwk.guard';
import { ICanvasUserData } from '../interfaces/canvas-platform.interfaces';
import {
  TTemplateCreateInput,
  TTemplateSchoolAbilitiesCourseData,
  TTemplateUpdateInput,
} from '../../../templates/types/template.types';
import {
  CanvasPlatformCreateTemplateDto,
  EditCanvasPlatformCreateTemplateDto,
  EmmitCanvasPlatformCertificateDto,
} from '../dtos/templates/canvas-templates-input.dto';
import {
  ResponseCanvasPlatformEmmitedBulkCertificatesDto,
  ResponseCanvasPlatformTemplateDto,
  ResponseCanvasPlatformTemplatesDto,
} from '../dtos/templates/canvas-templates-response.dto';
import { randomUUID } from 'crypto';

@ApiTags('Canvas Platform -- Templates')
@Controller('canvas-platform')
@UseGuards(CanvasJwtGuard)
export class CanvasTemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly auxService: AuxService,
    private readonly schoolsService: SchoolsService,
    private readonly coursesService: CoursesService,
    private readonly certificatesService: CertificatesService,
    private readonly usersService: UsersService,
    private readonly backgroundsService: BackgroundsService,
  ) {}

  @UseInterceptors(FileInterceptor('imageLogo'))
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt', 'issuedAt', 'expiresAt']))
  @Post('/templates')
  async createCanvasTemplate(
    @CanvasGetUser() canvasUser: ICanvasUserData,
    @Body() dto: CanvasPlatformCreateTemplateDto,
    @UploadedFile() imageLogo?: Express.Multer.File,
  ): Promise<ResponseCanvasPlatformTemplateDto> {
    try {
      const parsed = parseInt(dto.hoursWorkload);
      if (isNaN(parsed)) {
        throw new Error();
      }
    } catch {
      throw new BadRequestException('Invalid hoursWorkload value');
    }

    const validAbilitiesIds = await this.auxService.getValidAbilityIds(dto.abilities);

    if (validAbilitiesIds.length === 0) {
      throw new BadRequestException('No valid Abilities to include');
    }

    const school = await this.schoolsService.getSchoolById(canvasUser.schoolId);
    if (!school) {
      throw new NotFoundException('School not found');
    }

    const pj = await this.auxService.getPjInfo(canvasUser.userId);

    if (school.ownerUserId != pj.idPJ) {
      throw new ForbiddenException('User does not own this school');
    }

    const backgroundImage = await this.backgroundsService.getBackgroundInfoById(dto.backgroundImageId);

    if (!backgroundImage || !backgroundImage.isValid) {
      throw new NotFoundException('Background image not found');
    }

    const backgroundImagePath = `${this.auxService.cloudfrontBucket}/${backgroundImage.imageUrl}`;

    const templateVersion = 1;
    const templateId = randomUUID();
    const templateImageDestinationPath = this.auxService.getTemplateImagePath(
      canvasUser.userId,
      templateId,
      templateVersion,
    );

    const templateInfo: TTemplateCreateInput = {
      templateId: templateId,
      description: dto.description,
      name: dto.name,
      descriptionImage: dto?.descriptionImage ?? null,
      cargaHoraria: parseInt(dto.hoursWorkload),
      backgroundImage: backgroundImagePath,
      issuedAt: this.auxService.formatDate(dto?.issuedAt) ?? null,
      expiresAt: this.auxService.formatDate(dto?.expiresAt) ?? null,
      certificatePicture: templateImageDestinationPath,
      version: templateVersion,
      qrCodePosition: dto.qrCodePosition,
      school: { connect: { schoolId: canvasUser.schoolId } },
      backgroundImages: { connect: { backgroundId: backgroundImage.backgroundId } },
      habilidades: { create: validAbilitiesIds.map((abilityId: string) => ({ habilidadeId: abilityId })) },
      courses: { create: { courseId: canvasUser.courseId } },
    };

    if (imageLogo) {
      templateInfo.logoImage = await this.templatesService.uploadLogoImage(
        canvasUser.userId,
        templateId,
        templateVersion,
        imageLogo,
      );
    }

    const template = await this.templatesService.createTemplate(templateInfo, pj.nomeFantasia);

    return this.getTemplateResponse(template);
  }

  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt', 'issuedAt', 'expiresAt']))
  @Get('/templates')
  async getAllCanvasTemplate(
    @CanvasGetUser() canvasUser: ICanvasUserData,
  ): Promise<ResponseCanvasPlatformTemplatesDto> {
    const course = await this.coursesService.getCourseWithTemplates(canvasUser.courseId);

    return {
      templates: course.templates.map((template) => {
        const templateInfo = template.template;
        return {
          templateId: templateInfo.templateId,
          createdAt: templateInfo.createdAt,
          schoolName: templateInfo.school.name,
          name: templateInfo.name,
          hoursWorkload: templateInfo.cargaHoraria,
          categories: templateInfo.habilidades.map((habilidade) => {
            return habilidade.habilidade.tema;
          }),
          issuedAt: templateInfo?.issuedAt ?? templateInfo.createdAt,
          expiresAt: templateInfo?.expiresAt ?? null,
          imageTemplateUrl: templateInfo.certificatePicture,
        };
      }),
    };
  }

  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt', 'issuedAt', 'expiresAt']))
  @Get('/templates/:templateId')
  async getCanvasTemplate(
    @CanvasGetUser() canvasUser: ICanvasUserData,
    @Param('templateId') templateId: string,
  ): Promise<ResponseCanvasPlatformTemplateDto> {
    const template = await this.templatesService.getTemplateById(templateId);

    if (template.schoolId != canvasUser.schoolId) {
      throw new ForbiddenException('User does not own this template');
    }

    return this.getTemplateResponse(template);
  }

  @Post('clone/templates/:templateId')
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt', 'issuedAt', 'expiresAt']))
  async cloneCanvasTemplate(
    @CanvasGetUser() canvasUser: ICanvasUserData,
    @Param('templateId') templateId: string,
  ): Promise<ResponseCanvasPlatformTemplateDto> {
    const templateData = await this.templatesService.getTemplateById(templateId);

    if (!templateData) {
      throw new NotFoundException('Template not found');
    }

    const school = await this.schoolsService.getSchoolById(templateData.schoolId);

    const pj = await this.auxService.getPjInfo(canvasUser.userId);

    if (school.ownerUserId != pj.idPJ) {
      throw new ForbiddenException('User does not own this template');
    }

    const templateInfo = await this.templatesService.getCloneTemplateCreateInput(canvasUser.userId, templateData);

    const template = await this.templatesService.createTemplate(templateInfo, pj.nomeFantasia);

    return this.getTemplateResponse(template);
  }

  @Patch('templates/:templateId')
  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt', 'issuedAt', 'expiresAt']))
  @UseInterceptors(FileInterceptor('imageLogo'))
  async editCanvasTemplate(
    @CanvasGetUser() canvasUser: ICanvasUserData,
    @Param('templateId') templateId: string,
    @Body() dto: EditCanvasPlatformCreateTemplateDto,
    @UploadedFile() imageLogo?: Express.Multer.File,
  ): Promise<ResponseCanvasPlatformTemplateDto> {
    try {
      const parsed = parseInt(dto.hoursWorkload);
      if (isNaN(parsed)) {
        throw new Error();
      }
    } catch {
      throw new BadRequestException('Invalid hoursWorkload value');
    }
    const validAbilitiesIds = await this.auxService.getValidAbilityIds(dto.abilities);

    if (validAbilitiesIds.length === 0) {
      throw new BadRequestException('No valid Abilities found');
    }

    const backgroundImage = await this.backgroundsService.getBackgroundInfoById(dto.backgroundImageId);

    if (!backgroundImage || !backgroundImage.isValid) {
      throw new NotFoundException('Background image not found');
    }
    const templateData = await this.templatesService.getTemplateById(templateId);

    if (!templateData) {
      throw new NotFoundException('Template Not Found');
    }

    const pj = await this.auxService.getPjInfo(canvasUser.userId);

    if (!(templateData.school.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException('This user does not own this template');
    }

    const certCount = await this.templatesService.getTemplateCertificateCount(templateId);

    if (certCount > 0) {
      throw new BadRequestException('Template cannot be edited as certificates were already emitted');
    }

    const templateVersion = templateData.version + 1;

    const backgroundImagePath = `${this.auxService.cloudfrontBucket}/${backgroundImage.imageUrl}`;

    const templateImageDestinationPath = this.auxService.getTemplateImagePath(
      canvasUser.userId,
      templateId,
      templateVersion,
    );

    const templateInfo: TTemplateUpdateInput = {
      description: dto.description,
      name: dto.name,
      descriptionImage: dto?.descriptionImage ?? null,
      cargaHoraria: parseInt(dto.hoursWorkload),
      backgroundImage: backgroundImagePath,
      issuedAt: this.auxService.formatDate(dto?.issuedAt) ?? this.auxService.getCurrentDateAsString(),
      expiresAt: this.auxService.formatDate(dto?.expiresAt) ?? null,
      certificatePicture: templateImageDestinationPath,
      version: templateVersion,
      qrCodePosition: dto.qrCodePosition,
      habilidades: { create: validAbilitiesIds.map((abilityId: string) => ({ habilidadeId: abilityId })) },
      school: { connect: { schoolId: templateData.schoolId } },
      courses: {
        create: templateData.courses.map((course) => {
          return { courseId: course.courseId };
        }),
      },
    };

    if (imageLogo) {
      templateInfo.logoImage = await this.templatesService.uploadLogoImage(
        canvasUser.userId,
        templateId,
        templateVersion,
        imageLogo,
      );
    }

    if (dto.schoolId !== templateData.schoolId) {
      templateInfo.school.connect = { schoolId: dto.schoolId };
    }

    if (dto?.courseId && !templateData.courses.map((course) => course.courseId).includes(dto?.courseId)) {
      templateInfo.courses.create = { courseId: dto.courseId };
    }

    await this.templatesService.updateTemplate(templateId, templateInfo, templateData.school.userId.nomeFantasia);

    return this.getTemplateResponse(await this.templatesService.getTemplateById(templateId));
  }

  @Delete('templates/:templateId')
  async deleteCanvasTemplate(
    @CanvasGetUser() canvasUser: ICanvasUserData,
    @Param('templateId') templateId: string,
  ): Promise<{ success: boolean }> {
    const template = await this.templatesService.getTemplateById(templateId);

    if (!template) {
      throw new NotFoundException('Template Not Found');
    }

    const pj = await this.auxService.getPjInfo(canvasUser.userId);

    if (!(template.school.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException('This user does not own this template');
    }

    const certCount = await this.templatesService.getTemplateCertificateCount(templateId);

    if (certCount > 0) {
      throw new BadRequestException('Template cannot be deleted as certificates were already emitted');
    }

    await this.templatesService.deleteTemplateRecord(templateId);

    return { success: true };
  }

  @Post('templates/:templateId/certificates')
  async createCertificatesFromTemplate(
    @CanvasGetUser() canvasUser: ICanvasUserData,
    @Param('templateId') templateId: string,
    @Body() dto: EmmitCanvasPlatformCertificateDto,
  ): Promise<ResponseCanvasPlatformEmmitedBulkCertificatesDto> {
    const templateData = await this.templatesService.getTemplateById(templateId);

    if (!templateData) {
      throw new NotFoundException('Template Not Found');
    }

    const pj = await this.auxService.getPjInfo(canvasUser.userId);

    if (templateData.school.ownerUserId !== pj.idPJ) {
      throw new ForbiddenException('This user does not own this template');
    }

    const students = await this.usersService.getUsersPfByIds(dto.userIds);

    const eventId = randomUUID();
    students.map(async (student) => {
      const studentInfo = {
        templateId: templateId,
        docNumber: student.numeroDocumento,
        email: student.email,
        name: student?.pessoaFisica?.nome ?? student?.tempName ?? '',
      };

      await this.certificatesService.issueCertificateFromTemplate(studentInfo, templateData, eventId);
    });

    return {
      notFound: dto.userIds.filter((userId) => !students.map((student) => student.id).includes(userId)),
      emmitedCertificates: students.map((student) => student.id),
    };
  }

  private getTemplateResponse(templateRecord: TTemplateSchoolAbilitiesCourseData): ResponseCanvasPlatformTemplateDto {
    return {
      ...templateRecord,
      hoursWorkload: templateRecord.cargaHoraria,
      imageTemplateUrl: templateRecord.certificatePicture,
      abilities: templateRecord.habilidades.map((ability) => {
        return {
          abilityId: ability.habilidadeId,
          category: ability.habilidade.tema,
          ability: ability.habilidade.habilidade,
        };
      }),
      courses: templateRecord.courses.map((course) => {
        const courseInfo = course.course;
        return {
          courseId: courseInfo.courseId,
          courseName: courseInfo.name,
        };
      }),
    };
  }
}
