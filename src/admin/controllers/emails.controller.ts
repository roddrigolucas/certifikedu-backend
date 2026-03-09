import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailsService } from '../../emails/emails.service';
import { JwtGuard } from '../../auth/guard';
import { RolesGuard } from '../../users/guards';
import { Roles } from '../../users/decorators';
import { RequestsService } from '../../requests/requests.service';
import { ResponseEmailInfoAdminDto, ResponseInternalEmailTemplateAdminDto } from '../dtos/emails/emails-response.dto';
import {
  CreateInternalEmailTemplateAdminDto,
  UpdateInternalEmailTemplateAdminDto,
} from '../dtos/emails/emails-input.dto';

@ApiTags('ADMIN -- Emails')
@Controller('admin/emails')
@UseGuards(JwtGuard, RolesGuard)
export class EmailsAdminController {
  constructor(private readonly emailService: EmailsService, private readonly requestsService: RequestsService) {}

  @Roles('admin')
  @Get()
  async getInternalTemplates(): Promise<Array<ResponseInternalEmailTemplateAdminDto>> {
    const emails = await this.emailService.getInternalTemplates();

    return emails.map((email) => {
      return {
        emailId: email.emailId,
        templateKey: email.templateKey,
        templateName: email.templateName,
        deletable: email.deletable,
        subject: email.subject,
        variables: email.variables,
        variablesNames: email.variablesNames,
        types: email.types,
      };
    });
  }

  @Roles('admin')
  @Post()
  async createInternalTemplates(@Body() dto: CreateInternalEmailTemplateAdminDto): Promise<ResponseEmailInfoAdminDto> {
    await this.requestsService.emailTemplateLambda({
      templateKey: dto.templateKey,
      templateName: dto.templateName,
      subject: dto.subject,
      variables: dto.variables,
    });

    await this.emailService.createInternalTemplateRecord(dto);

    return {
      statusCode: 200,
      status: 'Success',
      response: { message: 'Email cadastrado com sucesso' },
    };
  }

  @Roles('admin')
  @Patch(':emailId')
  async updateInternalTemplates(
    @Body() dto: UpdateInternalEmailTemplateAdminDto,
    @Param('emailId') emailId: string,
  ): Promise<ResponseEmailInfoAdminDto> {
    const email = await this.emailService.updateInternalTemplateRecord(emailId, dto);

    if (!email) {
      throw new NotFoundException('Email template not found');
    }

    await this.requestsService.emailTemplateLambda({
      templateKey: dto.templateKey,
      templateName: dto.templateName,
      subject: dto.subject,
      variables: dto.variables,
    });

    return {
      statusCode: 200,
      status: 'Success',
      response: { message: 'Email atualizado com sucesso' },
    };
  }

  @Roles('admin')
  @Delete(':emailId')
  async deleteInternalTemplates(@Param('emailId') emailId: string): Promise<{ success: boolean }> {
    const email = await this.emailService.getInternalEmailTemplateById(emailId);

    if (!email) {
      throw new NotFoundException('Email not Found');
    }

    if (!email.deletable) {
      throw new ForbiddenException('This email cannot be deleted');
    }

    await this.emailService.deleteTemplateRecord(emailId);

    return { success: true };
  }
}
