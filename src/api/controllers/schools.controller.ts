import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TAcademicCredentialsOutput } from '../../academic-credentials/types/academic-credentials.types';
import { AuxService } from '../../_aux/_aux.service';
import { TSchoolCreateInput, TSchoolOutput, TSchoolUpdateInput } from '../../schools/types/schools.types';
import { GetUser } from '../../auth/decorators';
import { DateFormat } from '../../interceptors/dateformat.interceptor';
import { SchoolsService } from '../../schools/schools.service';
import { ResponseAcademicCredentialsAPIDto } from '../dtos/academic-credentias/academic-credentials-response.dto';
import { CreateNewSchoolAPIDto, UpdateSchoolAPIDto } from '../dtos/schools/schools-input.dto';
import { ResponseSchoolAPIDto } from '../dtos/schools/schools-response.dto';
import { ApiKeyGuard } from '../guards/api_secret.guard';

@ApiTags('API Schools')
@UseGuards(ApiKeyGuard)
@Controller('api/v1')
export class SchoolsAPIController {
  constructor(private readonly schoolsService: SchoolsService, private readonly auxService: AuxService) {}

  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt']))
  @Post('school')
  async createSchoolAPI(
    @GetUser('id') userId: string,
    @Body() schoolInfo: CreateNewSchoolAPIDto,
  ): Promise<ResponseSchoolAPIDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const schoolRecord = await this.schoolsService.getSchoolByCnpj(schoolInfo.schoolCnpj);

    if (schoolRecord) {
      if (schoolRecord.ownerUserId != pj.idPJ) {
        throw new ForbiddenException('School with CNPJ already registered');
      }

      return this.getSchoolResponse(schoolRecord);
    }

    const schoolData: TSchoolCreateInput = {
      ...schoolInfo,
      logoImage: null,
      userId: { connect: { idPJ: pj.idPJ } },
    };

    const school = await this.schoolsService.createSchool(schoolData);

    return this.getSchoolResponse(school);
  }

  @UseInterceptors(new DateFormat(['createdAt', 'updatedAt']))
  @Get('schools')
  async getAllSchoolsAPI(@GetUser('id') userId: string): Promise<Array<ResponseSchoolAPIDto>> {
    const pj = await this.auxService.getPjInfo(userId);

    const schools = await this.schoolsService.getAllUserSchools(pj.idPJ);

    return schools.map((school) => this.getSchoolResponse(school));
  }

  @Get('schools/:id')
  async getSchoolByIdAPI(@GetUser('id') userId: string, @Param('id') schoolId: string): Promise<ResponseSchoolAPIDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const school = await this.schoolsService.getSchoolById(schoolId);

    if (!school) {
      throw new NotFoundException('School not found.');
    }

    if (!(school.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException('This user is not the owner of this school.');
    }

    return this.getSchoolResponse(school);
  }

  @Patch('school/:id')
  async editSchoolAPI(
    @GetUser('id') userId: string,
    @Body() schoolInfo: UpdateSchoolAPIDto,
    @Param('id') schoolId: string,
  ): Promise<ResponseSchoolAPIDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const schoolRecord = await this.schoolsService.getSchoolById(schoolId);

    if (!schoolRecord) {
      throw new NotFoundException('School not found.');
    }

    if (schoolRecord.isCanvas) {
      throw new ForbiddenException('This school cannot be edited.');
    }

    if (schoolRecord.ownerUserId != pj.idPJ) {
      throw new ForbiddenException('This school cannot be edited by this user.');
    }

    const schoolData: TSchoolUpdateInput = schoolInfo;

    const school = await this.schoolsService.editSchool(schoolId, schoolData);

    return this.getSchoolResponse(school);
  }

  @Patch('/school/:schoolId/credentials/:credentialId')
  async addSchoolCredentials(
    @GetUser('id') userId: string,
    @Param('schoolId') schoolId: string,
    @Param('credentialId') credentialId: string,
  ): Promise<ResponseSchoolAPIDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const schoolInfo = await this.schoolsService.getSchoolWithCredentialsById(schoolId);

    if (!schoolInfo) {
      throw new NotFoundException('School not found.');
    }

    if (!(schoolInfo.ownerUserId == pj.idPJ)) {
      throw new ForbiddenException('This user is not the owner of this school.');
    }

    if (schoolInfo?.academicCredentials) {
      throw new BadRequestException('Schools already has credentials');
    }

    const credential = await this.schoolsService.getCredentialsById(credentialId);

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    const school = await this.schoolsService.addSchoolsCredentials(schoolId, credentialId);

    const schoolResponse = this.getSchoolResponse(school);

    return {
      ...schoolResponse,
      credentials: this.getCredentialsResponse(credential),
    };
  }

  private getSchoolResponse(school: TSchoolOutput): ResponseSchoolAPIDto {
    return {
      schoolId: school.schoolId,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
      schoolCnpj: school.schoolCnpj,
      homepageUrl: school.homepageUrl,
      phoneNumber: school.phoneNumber,
      description: school.description,
      email: school.email,
      name: school.name,
    };
  }

  private getCredentialsResponse(credential: TAcademicCredentialsOutput): ResponseAcademicCredentialsAPIDto {
    return {
      credentialId: credential.credentialId,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
      emecCode: credential.emecCode,
      type: credential.type,
      number: credential.number,
      description: credential.description,
      issuedAt: credential.issuedAt,
      publishedDate: credential.publishedDate,
      publishingVehicle: credential.publishingVehicle,
      publishingSection: credential.publishingSection,
      publishingPage: credential.publishingPage,
      numberDOU: credential.numberDOU,
      credentialType: credential.credentialType,
    };
  }
}
