import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TAcademicCredentialsCreateInput, TAcademicCredentialsOutput } from './types/academic-credentials.types';

@Injectable()
export class AcademicCredentialsService {
  constructor(private readonly prismaService: PrismaService) { }

  async createCredentials(
    data: TAcademicCredentialsCreateInput,
  ): Promise<TAcademicCredentialsOutput> {
    return  await this.prismaService.academicCredentials.create({
      data: data,
    });
  }

}
