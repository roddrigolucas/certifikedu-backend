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
import { AuxService } from '../../_aux/_aux.service';
import { TInternshipCreateInput, TIntershipWithCurriculumOutput } from '../../internships/types/internships.types';
import { GetUser } from '../../auth/decorators';
import { InternshipsService } from '../../internships/internships.service';
import { CreateInternshipAPIDto, EditInternshipAPIDto } from '../dtos/internships/internships-input.dto';
import { ResponseInternshipAPIDto } from '../dtos/internships/internships-response.dto';
import { ApiKeyGuard } from '../guards/api_secret.guard';

@ApiTags('API Internships')
@UseGuards(ApiKeyGuard)
@Controller('api/v1')
export class InternshipsAPIController {
  constructor(private readonly internshipsService: InternshipsService,
    private readonly auxService: AuxService) { }

  @Get('internships')
  async getUserInternship(@GetUser('id') userId: string): Promise<Array<ResponseInternshipAPIDto>> {
    const pj = await this.auxService.getPjInfo(userId);

    const internships = await this.internshipsService.getUserInternship(pj.idPJ);

    return internships.map((internship) => this.getInternshipResponse(internship));
  }

  @Post('internships')
  async createInternship(
    @GetUser('id') userId: string,
    @Body() dto: CreateInternshipAPIDto,
  ): Promise<ResponseInternshipAPIDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const { studyField, curriculums, ...rest } = dto;

    const internshipData: TInternshipCreateInput = {
      ...rest,
      user: { connect: { idPJ: pj.idPJ } },
    };

    const internshipRecord = await this.internshipsService.checkInternship({ ...rest, userId: pj.idPJ });

    if (internshipRecord) {
      return {
        internshipId: internshipRecord.internshipId,
        createdAt: internshipRecord.createdAt,
        updatedAt: internshipRecord.updatedAt,
        name: internshipRecord.name,
        description: internshipRecord.description,
        hoursWorkload: internshipRecord.hoursWorkload,
        curriculums: internshipRecord.curriculums.map((curriculum) => {
          return curriculum.curriculumId;
        }),
        studyField: internshipRecord?.studyFieldId ?? null,
      };
    }

    if (studyField) {
      internshipData.studyFields = { connect: { studyFieldId: studyField } };
    }

    if (curriculums.length > 0) {
      internshipData.curriculums = {
        create: curriculums.map((c) => {
          return { curriculumId: c };
        }),
      };
    }

    const internship = await this.internshipsService.createInternship(internshipData);

    return this.getInternshipResponse(internship);
  }

  @Get('internship/:id')
  async getInternshipById(
    @GetUser('userId') userId: string,
    @Param('id') internshipId: string,
  ): Promise<ResponseInternshipAPIDto> {
    const internship = await this.internshipsService.getInternshipById(internshipId);

    if (!internship) {
      throw new NotFoundException('internship not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (internship.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this internship');
    }

    return this.getInternshipResponse(internship);
  }

  @Patch('internship/:id')
  async editInternship(
    @GetUser('userId') userId: string,
    @Param('id') internshipId: string,
    @Body() dto: EditInternshipAPIDto,
  ): Promise<ResponseInternshipAPIDto> {
    const internshipRecord = await this.internshipsService.getInternshipById(internshipId);

    if (!internshipRecord) {
      throw new NotFoundException('internship not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (internshipRecord.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this internship');
    }

    const internship = await this.internshipsService.editInternship(internshipId, dto);

    return this.getInternshipResponse(internship);
  }

  @Delete('internship/:id')
  async deleteInternship(
    @GetUser('id') userId: string,
    @Param('id') internshipId: string,
  ): Promise<{ status: string }> {
    const internshipRecord = await this.internshipsService.getInternshipById(internshipId);

    if (!internshipRecord) {
      throw new NotFoundException('internship not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (internshipRecord.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this internship');
    }

    await this.internshipsService.deleteInternship(internshipId);
    return { status: 'Success' };
  }

  private getInternshipResponse(internship: TIntershipWithCurriculumOutput): ResponseInternshipAPIDto {
    return {
      internshipId: internship.internshipId,
      createdAt: internship.createdAt,
      updatedAt: internship.updatedAt,
      name: internship.name,
      description: internship.description,
      hoursWorkload: internship.hoursWorkload,
      curriculums: internship.curriculums.map((curriculum) => {
        return curriculum.curriculumId;
      }),
    };
  }
}
