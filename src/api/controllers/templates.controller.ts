import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { AuxService } from '../../_aux/_aux.service';
import { BackgroundsService } from '../../backgrounds/background.service';
import { SchoolsService } from '../../schools/schools.service';
import { TTemplateCreateInput, TTemplateSchoolAbilitiesCourseData } from '../../templates/types/template.types';
import { GetUser } from '../../auth/decorators';
import { DateFormat } from '../../interceptors/dateformat.interceptor';
import { TemplatesService } from '../../templates/templates.service';
import { CreateOrUpdateTemplateAPIDto } from '../dtos/templates/templates-input.dto';
import { ResponseTemplateDataAPIDto, ResponseTemplatesAPIDto } from '../dtos/templates/templates-response.dto';
import { ApiKeyGuard } from '../guards/api_secret.guard';

@ApiTags('API Templates')
@UseGuards(ApiKeyGuard)
@Controller('api/v1')
export class TemplatesAPIController {
  constructor(
    private readonly templateService: TemplatesService,
    private readonly auxService: AuxService,
    private readonly schoolsService: SchoolsService,
    private readonly backgroundsService: BackgroundsService,
  ) {}

  @Post('templates/create')
  @UseInterceptors(FileInterceptor('imageLogo'))
  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt', 'createdAt', 'updatedAt']))
  async createTemplate(
    @GetUser('id') userId: string,
    @Body() dto: CreateOrUpdateTemplateAPIDto,
    @UploadedFile() imageLogo?: Express.Multer.File,
  ): Promise<ResponseTemplateDataAPIDto> {
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

    const school = await this.schoolsService.getSchoolById(dto.schoolId);
    if (!school) {
      throw new NotFoundException('School not found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (school.ownerUserId != pj.idPJ) {
      throw new ForbiddenException('User does not own this school');
    }

    const backgroundImage = await this.backgroundsService.getBackgroundInfoById(dto.backgroundImageId);

    if (!backgroundImage) {
      throw new NotFoundException('Background image not found');
    }

    const backgroundImagePath = `${this.auxService.cloudfrontBucket}/${backgroundImage.imageUrl}`;

    const templateVersion = 1;
    const templateId = randomUUID();
    const templateImageDestinationPath = this.auxService.getTemplateImagePath(userId, templateId, templateVersion);

    const templateInfo: TTemplateCreateInput = {
      templateId: templateId,
      name: dto.name,
      description: dto.description,
      descriptionImage: dto?.descriptionImage ?? null,
      cargaHoraria: parseInt(dto.hoursWorkload) * 60,
      backgroundImage: backgroundImagePath,
      issuedAt: this.auxService.formatDate(dto?.issuedAt) ?? null,
      expiresAt: this.auxService.formatDate(dto?.expiresAt) ?? null,
      certificatePicture: templateImageDestinationPath,
      version: templateVersion,
      school: { connect: { schoolId: dto.schoolId } },
      backgroundImages: { connect: { backgroundId: backgroundImage.backgroundId } },
      habilidades: { create: validAbilitiesIds.map((abilityId: string) => ({ habilidadeId: abilityId })) },
    };

    if (dto?.courseId) {
      templateInfo.courses.create = { courseId: dto.courseId };
    }

    if (imageLogo) {
      templateInfo.logoImage = await this.templateService.uploadLogoImage(
        userId,
        templateId,
        templateVersion,
        imageLogo,
      );
    }

    const template = await this.templateService.createTemplate(templateInfo, pj.nomeFantasia);

    return this.getTemplateApiResponse(template);
  }

  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt', 'createdAt', 'updatedAt']))
  @Get('/template/:id')
  async getTemplateById(
    @Param('id') templateId: string,
    @GetUser('id') userId: string,
  ): Promise<ResponseTemplateDataAPIDto> {
    const template = await this.templateService.getTemplateById(templateId);

    if (!template) {
      throw new NotFoundException('Template Not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (!(template.school.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException('This user does not own this template');
    }

    return this.getTemplateApiResponse(template);
  }

  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt', 'createdAt', 'updatedAt']))
  @Get('/template/school/:id')
  async getTemplatesBySchool(
    @Param('id') schoolId: string,
    @GetUser('id') userId: string,
  ): Promise<ResponseTemplatesAPIDto> {
    const school = await this.schoolsService.getSchoolById(schoolId);

    if (!school) {
      throw new NotFoundException('School not found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (school.ownerUserId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this school');
    }

    const templates = await this.templateService.getTemplatesBySchoolId(schoolId);

    return {
      templates: templates.map((template) => this.getTemplateApiResponse(template)),
    };
  }

  private getTemplateApiResponse(templateRecord: TTemplateSchoolAbilitiesCourseData): ResponseTemplateDataAPIDto {
    return {
      ...templateRecord,
      hoursWorkload: templateRecord.cargaHoraria / 60,
      imageTemplateUrl: templateRecord.certificatePicture,
      abilities: templateRecord.habilidades.map((ability) => {
        return {
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
