import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { DateFormat } from '../interceptors/dateformat.interceptor';
import { TemplatesService } from './templates.service';
import { ApiTags } from '@nestjs/swagger';
import { PublicTemplateResponseDto } from './dtos/templates-response.dto';
import { StudentInfoDto } from './dtos/templates-input.dto';
import { CertificatesService } from '../certificates/certificates.service';

@ApiTags('Public -- Templates')
@Controller('templates')
export class TemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly certificatesService: CertificatesService,
  ) {}

  @Get('/:templateId')
  @UseInterceptors(new DateFormat(['issuedAt', 'expiresAt', 'createdAt', 'updatedAt']))
  async listTemplates(@Param('templateId') templateId: string): Promise<PublicTemplateResponseDto> {
    const template = await this.templatesService.getTemplateById(templateId);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const issuedCertificates = await this.templatesService.getTemplateCertificateCount(templateId);

    return {
      templateId: templateId,
      name: template.name,
      hasStarted: this.templatesService.hasStarted(template.startDateTime),
      isExpired: this.templatesService.isExpired(template.expirationDateTime),
      isLimitOfIssuesReached: this.templatesService.isIssueLimitReached(template.issuesNumberLimit, issuedCertificates),
    };
  }

  @Get('check/document/:document/template/:templateId')
  async checkAllowedDocuments(
    @Param('document') document: string,
    @Param('templateId') templateId: string,
  ): Promise<{ allowed: boolean }> {
    if (!templateId || !document) {
      throw new BadRequestException('Invalid Document or TemplateId');
    }

    if (await this.templatesService.checkIfTemplateHasWhitelist(templateId)) {
      return { allowed: true };
    }

    const allowedDocuments = await this.templatesService.getAllowedDocumentsForTemplate(templateId);

    return { allowed: allowedDocuments.includes(document) };
  }

  @Post('/create/certificate')
  async createTemplateCertificate(@Body() studentInfo: StudentInfoDto): Promise<{ success: boolean }> {
    const template = await this.templatesService.getTemplateById(studentInfo.templateId);

    await this.certificatesService.issueCertificateFromTemplate(studentInfo, template);

    return { success: true };
  }
}
