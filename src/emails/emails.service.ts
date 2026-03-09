import {
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TEmailCreateInput, TEmailOutput, TEmailUpdateInput } from './types/emails.types';

@Injectable()
export class EmailsService {
  constructor(
    private prismaService: PrismaService,
  ) { }

  async getInternalEmailTemplateById(emailId: string): Promise<TEmailOutput> {
    return await this.prismaService.internalEmailTemplates.findUnique({
      where: { emailId: emailId },
    });
  }

  async getInternalTemplates(): Promise<Array<TEmailOutput>> {
    return await this.prismaService.internalEmailTemplates.findMany({
      where: { isActive: true },
    });
  }

  async createInternalTemplateRecord(data: TEmailCreateInput): Promise<TEmailOutput> {
    return await this.prismaService.internalEmailTemplates.create({
      data: data,
    });
  }

  async updateInternalTemplateRecord(emailId: string, data: TEmailUpdateInput): Promise<TEmailOutput> {
    return await this.prismaService.internalEmailTemplates.update({
      where: { emailId: emailId },
      data: data,
    });
  }

  async deleteTemplateRecord(emailId: string) {
    await this.prismaService.internalEmailTemplates.delete({
      where: { emailId: emailId },
    });
  }
}
