import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { DateFormat } from '../../interceptors/dateformat.interceptor';
import { TemplatesService } from '../../templates/templates.service';
import { GetUser } from '../../auth/decorators';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { PJRoles } from '../decorators/roles-pj.decorator';
import { PJRolesGuard } from '../guards/roles-guards-pj.guard';
import { FontsService } from 'src/fonts/fonts.service';
import { AuxService } from '../../aux/aux.service';
import { SchoolsService } from '../../schools/schools.service';
import { BackgroundsService } from '../../backgrounds/background.service';
import { randomUUID } from 'crypto';
import {
  CreateOrUpdateTemplatePjInfoDto,
  TemplateAllowedDocumentsPjInfoDto,
  TemplateImagePreviewPjInfoDto,
  UpdateTemplateQrCodePjInfoDto,
} from '../dtos/templates/templates-input.dto';
import {
  AllowedDocumentsTemplatePjInfoResponse,
  ResponseImagePreviewPjInfoDto,
  ResponseTemplateDataPjInfoDto,
  ResponseTemplatesPjBasicDto,
  ResponseTemplatesPjInfoDto,
} from '../dtos/templates/templates-response.dto';
import {
  TTemplateAllowedDocsCreateInput,
  TTemplateCreateInput,
  TTemplateSchoolAbilitiesCourseData,
  TTemplateUpdateInput,
} from '../../templates/types/template.types';
import { ICreateCertificatePreview } from 'src/requests/requests.interfaces';
import { InverseService } from 'src/inverse/inverse.service';

@ApiTags('Institutional -- Templates')
@Controller('pj/:pjId')
@UseGuards(JwtGuard)
export class TemplatesInstitutionalController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly auxService: AuxService,
    private readonly fontsService: FontsService,
    private readonly schoolsService: SchoolsService,
    private readonly backgroundsService: BackgroundsService,
    private readonly inverseService: InverseService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt']))
  @UseInterceptors(FileInterceptor('imageLogo'))
  @Post('/template')
  async createTemplate(
    @GetUser('id') userId: string,
    @Body() dto: CreateOrUpdateTemplatePjInfoDto,
    @UploadedFile() imageLogo?: Express.Multer.File,
  ): Promise<ResponseTemplateDataPjInfoDto> {
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

    if (dto.inverseId) {
      const inverse = await this.inverseService.getInverseInfoById(dto.inverseId);

      if (!inverse) {
        throw new NotFoundException('Inverse Image not Found');
      }
    }

    const backgroundImage = await this.backgroundsService.getBackgroundInfoById(dto.imageTemplate);

    if (!backgroundImage || !backgroundImage.isValid) {
      throw new NotFoundException('Background image not found');
    }

    const backgroundImagePath = `${this.auxService.cloudfrontBucket}/${backgroundImage.imageUrl}`;

    const templateVersion = 1;
    const templateId = randomUUID();
    const templateImageDestinationPath = this.auxService.getTemplateImagePath(userId, templateId, templateVersion);

    const templateInfo: TTemplateCreateInput = {
      templateId: templateId,
      description: dto.description,
      name: dto.name,
      descriptionImage: dto?.descriptionImage ?? null,
      cargaHoraria: dto.hoursWorkload * 60,
      backgroundImage: backgroundImagePath,
      issuedAt: this.auxService.formatDate(dto?.issuedAt) ?? new Date(),
      expiresAt: this.auxService.formatDate(dto?.expiresAt) ?? null,
      certificatePicture: templateImageDestinationPath,
      version: templateVersion,
      school: { connect: { schoolId: dto.schoolId } },
      backgroundImages: { connect: { backgroundId: backgroundImage.backgroundId } },
      habilidades: { create: validAbilitiesIds.map((abilityId: string) => ({ habilidadeId: abilityId })) },
      qrCodePosition: dto.qrCodePosition,
      hexFontColor: dto.hexFontColor,
    };

    if (dto?.courseId) {
      templateInfo.courses = { create: { courseId: dto.courseId } };
    }

    if (dto?.inverseId) {
      templateInfo.inverseImages = { connect: { inverseId: dto.inverseId } };
    }

    if (imageLogo) {
      templateInfo.logoImage = await this.templatesService.uploadLogoImage(
        userId,
        templateId,
        templateVersion,
        imageLogo,
      );
    }

    if (dto.fontIdDesc) {
      if (!(await this.fontsService.checkFontById(dto.fontIdDesc))) {
        throw new NotFoundException('Font for description not found.');
      }

      templateInfo.fontDesc = { connect: { fontId: dto.fontIdDesc } };
    }

    if (dto.fontIdName) {
      if (!(await this.fontsService.checkFontById(dto.fontIdName))) {
        throw new NotFoundException('Font for name not found.');
      }

      templateInfo.fontName = { connect: { fontId: dto.fontIdName } };
    }

    const template = await this.templatesService.createTemplate(templateInfo, pj.nomeFantasia);

    return await this.getTemplateResponse(template);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt']))
  @PJRoles('basico')
  @Post('/template/clone/:templateId')
  async cloneTemplate(
    @GetUser('id') userId: string,
    @Param('templateId') templateId: string,
  ): Promise<ResponseTemplateDataPjInfoDto> {
    const templateData = await this.templatesService.getTemplateById(templateId);

    if (!templateData) {
      throw new NotFoundException('Template not found');
    }

    const school = await this.schoolsService.getSchoolById(templateData.schoolId);

    const pj = await this.auxService.getPjInfo(userId);

    if (school.ownerUserId != pj.idPJ) {
      throw new ForbiddenException('User does not own this template');
    }

    const templateInfo = await this.templatesService.getCloneTemplateCreateInput(userId, templateData);

    const template = await this.templatesService.createTemplate(templateInfo, pj.nomeFantasia);

    return await this.getTemplateResponse(template);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('/templates/basic')
  async getUserTemplatesInfo(@GetUser('id') userId: string): Promise<ResponseTemplatesPjBasicDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const schoolsData = await this.schoolsService.getAllUserSchools(pj.idPJ);

    const schoolIds: Array<string> = schoolsData.map((school) => {
      return school.schoolId;
    });

    const templates = await this.templatesService.getBasicTemplatesBySchoolIds(schoolIds);

    return {
      templates: templates
        .filter((template) => !template.learningPaths?.pathId)
        .map((template) => {
          return { templateId: template.templateId, name: template.name };
        }),
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt', 'createdAt', 'updatedAt']))
  @Get('/templates/')
  async getUserTemplates(@GetUser('id') userId: string): Promise<ResponseTemplatesPjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const schoolsData = await this.schoolsService.getAllUserSchools(pj.idPJ);

    const schoolIds: Array<string> = schoolsData.map((school) => {
      return school.schoolId;
    });

    const templates = await this.templatesService.getTemplatesBySchoolIds(schoolIds);

    return {
      templates: await Promise.all(templates.map(async (template) => await this.getTemplateResponse(template))),
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt', 'createdAt', 'updatedAt']))
  @Get('/template/:templateId')
  async getTemplateById(
    @GetUser('id') userId: string,
    @Param('templateId') templateId: string,
  ): Promise<ResponseTemplateDataPjInfoDto> {
    const template = await this.templatesService.getTemplateById(templateId);

    if (!template) {
      throw new NotFoundException('Template Not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (!(template.school.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException('This user does not own this template');
    }

    return await this.getTemplateResponse(template);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Delete('/template/:templateId')
  async deleteTemplate(
    @GetUser('id') userId: string,
    @Param('templateId') templateId: string,
  ): Promise<{ success: boolean }> {
    const template = await this.templatesService.getTemplateById(templateId);

    if (!template) {
      throw new NotFoundException('Template Not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

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

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt']))
  @UseInterceptors(FileInterceptor('imageLogo'))
  @Patch('templates/info/:templateId')
  async updateTemplateInfo(
    @GetUser('id') userId: string,
    @Param('templateId') templateId: string,
    @Body() dto: CreateOrUpdateTemplatePjInfoDto,
    @UploadedFile() imageLogo?: Express.Multer.File,
  ): Promise<ResponseTemplateDataPjInfoDto> {
    const validAbilitiesIds = await this.auxService.getValidAbilityIds(dto.abilities);

    if (validAbilitiesIds.length === 0) {
      throw new BadRequestException('No valid Abilities found');
    }

    const backgroundImage = await this.backgroundsService.getBackgroundInfoById(dto.imageTemplate);

    if (!backgroundImage || !backgroundImage.isValid) {
      throw new NotFoundException('Background image not found');
    }
    const templateData = await this.templatesService.getTemplateById(templateId);

    if (!templateData) {
      throw new NotFoundException('Template Not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (!(templateData.school.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException('This user does not own this template');
    }

    const certCount = await this.templatesService.getTemplateCertificateCount(templateId);

    if (certCount > 0) {
      throw new BadRequestException('Template cannot be edited as certificates were already emitted');
    }

    if (dto.inverseId) {
      const inverse = await this.inverseService.getInverseInfoById(dto.inverseId);

      if (!inverse) {
        throw new NotFoundException('Inverse Image not Found');
      }
    }

    const templateVersion = templateData.version + 1;

    const backgroundImagePath = `${this.auxService.cloudfrontBucket}/${backgroundImage.imageUrl}`;

    const templateImageDestinationPath = this.auxService.getTemplateImagePath(userId, templateId, templateVersion);

    const templateInfo: TTemplateUpdateInput = {
      description: dto.description,
      name: dto.name,
      descriptionImage: dto?.descriptionImage ?? null,
      cargaHoraria: dto.hoursWorkload * 60,
      backgroundImage: backgroundImagePath,
      issuedAt: this.auxService.formatDate(dto?.issuedAt) ?? new Date(),
      expiresAt: this.auxService.formatDate(dto?.expiresAt) ?? null,
      certificatePicture: templateImageDestinationPath,
      version: templateVersion,
      qrCodePosition: dto.qrCodePosition,
      hexFontColor: dto.hexFontColor,
      habilidades: { create: validAbilitiesIds.map((abilityId: string) => ({ habilidadeId: abilityId })) },
      school: { connect: { schoolId: templateData.schoolId } },
      courses: {
        create: templateData.courses.map((course) => {
          return { courseId: course.courseId };
        }),
      },
    };

    if (dto.schoolId !== templateData.schoolId) {
      templateInfo.school = { connect: { schoolId: dto.schoolId } };
    }

    if (dto?.courseId) {
      templateInfo.courses = { create: { courseId: dto.courseId } };
    }

    if (dto?.inverseId) {
      templateInfo.inverseImages = { connect: { inverseId: dto.inverseId } };
    }

    if (dto.fontIdDesc) {
      if (!(await this.fontsService.checkFontById(dto.fontIdDesc))) {
        throw new NotFoundException('Font for description not found.');
      }

      templateInfo.fontDesc = { connect: { fontId: dto.fontIdDesc } };
    }

    if (dto.fontIdName) {
      if (!(await this.fontsService.checkFontById(dto.fontIdName))) {
        throw new NotFoundException('Font for name not found.');
      }

      templateInfo.fontName = { connect: { fontId: dto.fontIdName } };
    }

    if (imageLogo) {
      templateInfo.logoImage = await this.templatesService.uploadLogoImage(
        userId,
        templateId,
        templateVersion,
        imageLogo,
      );
    }

    await this.templatesService.updateTemplate(templateId, templateInfo, templateData.school.userId.nomeFantasia);

    return await this.getTemplateResponse(await this.templatesService.getTemplateById(templateId));
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Patch('templates/:templateId')
  @HttpCode(204)
  async updateTemplate(
    @GetUser('id') userId: string,
    @Param('templateId') templateId: string,
    @Body() dto: UpdateTemplateQrCodePjInfoDto,
  ): Promise<{ success: boolean }> {
    if (Object.entries(dto).length === 0) {
      throw new BadRequestException('No fields to update.');
    }

    const template = await this.templatesService.getTemplateById(templateId);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (!(template.school.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException('This user does not own this template');
    }

    const templateInfo: TTemplateUpdateInput = {
      issuesNumberLimit: dto?.issuesNumberLimit ?? template?.issuesNumberLimit ?? null,
      startDateTime: dto?.startDateTime ?? template?.startDateTime ?? null,
      expirationDateTime: dto?.expirationDateTime ?? template?.expirationDateTime ?? null,
    };

    await this.templatesService.updateTemplateRecord(templateId, templateInfo);

    return { success: true };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Patch('templates/allowed-documents/:templateId')
  async insertAllowedDocuments(
    @GetUser('id') userId: string,
    @Param('templateId') templateId: string,
    @Body() dto: TemplateAllowedDocumentsPjInfoDto,
  ): Promise<{ success: boolean }> {
    if (Object.entries(dto.documents).length === 0) {
      throw new BadRequestException('No fields to update.');
    }

    const template = await this.templatesService.getTemplateById(templateId);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (!(template.school.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException('This user does not own this template');
    }

    const allowedDocuments = await this.templatesService.getAllowedDocumentsForTemplate(templateId);

    const allowedData: Array<TTemplateAllowedDocsCreateInput> = dto.documents
      .map((doc) => {
        if (!allowedDocuments.includes(doc)) {
          return {
            document: doc,
            templateId: templateId,
          };
        }
      })
      .filter((doc) => doc);

    await this.templatesService.insertTemplateAllowedDocuments(allowedData);

    return { success: true };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('templates/allowed-documents/:templateId')
  async getAllowedDocuments(
    @GetUser('id') userId: string,
    @Param('templateId') templateId: string,
  ): Promise<AllowedDocumentsTemplatePjInfoResponse> {
    const template = await this.templatesService.getTemplateById(templateId);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (!(template.school.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException('This user does not own this template');
    }

    return { documents: await this.templatesService.getAllowedDocumentsForTemplate(templateId) };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Patch('template/hide/:templateId')
  async hideTemplate(
    @GetUser('id') userId: string,
    @Param('templateId') templateId: string,
  ): Promise<{ success: boolean }> {
    const template = await this.templatesService.getTemplateById(templateId);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (!(template.school.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException('This user does not own this template');
    }

    await this.templatesService.updateTemplateRecord(templateId, { hidden: !template.hidden });

    return { success: true };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Post('image-preview')
  async imagePreview(
    @GetUser('id') userId: string,
    @Body() dto: TemplateImagePreviewPjInfoDto,
  ): Promise<ResponseImagePreviewPjInfoDto> {
    const background = await this.backgroundsService.getBackgroundInfoById(dto.imageTemplate);

    if (!background || !background.isValid) {
      throw new NotFoundException('Background image not found');
    }

    const hash = randomUUID();
    const previewUrl = this.auxService.getTemplatePreviewPath(userId, hash);

    let lambdaData: ICreateCertificatePreview = {
      picture_type: 'preview',
      template_bucket: this.auxService.cloudfrontBucket,
      template_path: background.imageUrl,
      destination_bucket: this.auxService.cloudfrontBucket,
      destination_path: previewUrl,
      certificate_name: dto.name,
      hash: hash,
      qrcode_position: dto.qrCodePosition,
      font_color: dto.hexFontColor ?? '#000000',
      description_image: dto.descriptionImage,
    };

    if (dto.fontIdDesc) {
      if (!(await this.fontsService.checkFontById(dto.fontIdDesc))) {
        throw new NotFoundException('Font for description not found.');
      }

      lambdaData.font_description_url = await this.fontsService.getFontUrlById(dto.fontIdDesc);
    }

    if (dto.fontIdName) {
      if (!(await this.fontsService.checkFontById(dto.fontIdName))) {
        throw new NotFoundException('Font for name not found.');
      }

      lambdaData.font_name_url = await this.fontsService.getFontUrlById(dto.fontIdName);
    }

    await this.templatesService.generateImagePreview(lambdaData);

    return { previewUrl: previewUrl };
  }

  private async getTemplateResponse(
    templateRecord: TTemplateSchoolAbilitiesCourseData,
  ): Promise<ResponseTemplateDataPjInfoDto> {
    return {
      templateId: templateRecord.templateId,
      schoolId: templateRecord.schoolId,
      createdAt: templateRecord.createdAt,
      updatedAt: templateRecord.updatedAt,
      schoolName: templateRecord.school.name,
      description: templateRecord.description,
      hidden: templateRecord.hidden,
      name: templateRecord.name,
      hoursWorkload: templateRecord.cargaHoraria / 60,
      abilities: templateRecord.habilidades.map((ability) => {
        return {
          abilityId: ability.habilidadeId,
          category: ability.habilidade.tema,
          ability: ability.habilidade.habilidade,
        };
      }),
      issuedAt: templateRecord.issuedAt,
      expiresAt: templateRecord.expiresAt,
      backgroundId: templateRecord.backgroundId,
      imageTemplateUrl: templateRecord.certificatePicture,
      logoImage: templateRecord.logoImage,
      descriptionImage: templateRecord.descriptionImage,
      qrCodePosition: templateRecord.qrCodePosition,
      emissionQty: await this.templatesService.getTemplateEmissionQty(templateRecord.templateId),
      courses: templateRecord.courses.map((course) => {
        const courseInfo = course.course;
        return {
          courseId: courseInfo.courseId,
          courseName: courseInfo.name,
        };
      }),
      issuesNumberLimit: templateRecord?.issuesNumberLimit,
      startDateTime: templateRecord?.startDateTime,
      expirationDateTime: templateRecord?.expirationDateTime,
      allowedDocuments: await this.templatesService.getAllowedDocumentsForTemplate(templateRecord.templateId),
      descriptionFontUrl: templateRecord?.fontDescId,
      nameFontUrl: templateRecord?.fontNameId,
    };
  }
}
