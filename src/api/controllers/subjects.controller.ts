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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuxService } from '../../aux/aux.service';
import {
  TSubjectCreateInput,
  TSubjectUpdateInput,
  TSubjectWithSemesterOutput,
} from '../../subjects/types/subjects.types';
import { GetUser } from '../../auth/decorators';
import { SubjectsService } from '../../subjects/subjects.service';
import { CreateSubjectAPIDto, EditSubjectAPIDto, SubjectToSemesterAPIDto } from '../dtos/subjects/subjects-input.dto';
import { ResponseSubjectAPIDto } from '../dtos/subjects/subjects-response.dto';
import { ApiKeyGuard } from '../guards/api_secret.guard';

@ApiTags('API Subjects')
@UseGuards(ApiKeyGuard)
@Controller('api/v1')
export class SubjectsAPIController {
  constructor(private readonly subjectsService: SubjectsService, private readonly auxService: AuxService) { }

  @Get('subjects')
  async getUserSubjects(@GetUser('id') userId: string): Promise<Array<ResponseSubjectAPIDto>> {
    const pj = await this.auxService.getPjInfo(userId);

    const subjects = await this.subjectsService.getUserSubjects(pj.idPJ);

    return subjects.map((subject) => this.getSubjectResponse(subject));
  }

  @Post('subject')
  async createSubject(@GetUser('id') userId: string, @Body() dto: CreateSubjectAPIDto): Promise<ResponseSubjectAPIDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const subjectData: TSubjectCreateInput = {
      ...dto,
      user: { connect: { idPJ: pj.idPJ } },
    };

    const subject = await this.subjectsService.createSubject(subjectData);

    return this.getSubjectResponse(subject);
  }

  @Get('subject/:id')
  async getSubjectById(@GetUser('id') userId: string, @Param('id') subjectId: string): Promise<ResponseSubjectAPIDto> {
    const subject = await this.subjectsService.getSubjectById(subjectId);

    if (!subject) {
      throw new NotFoundException('Subject not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (subject.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this Subject');
    }

    return this.getSubjectResponse(subject);
  }

  @Patch('subject/:id')
  async editSubject(
    @GetUser('id') userId: string,
    @Param('id') subjectId: string,
    @Body() dto: EditSubjectAPIDto,
  ): Promise<ResponseSubjectAPIDto> {
    const subjectRecord = await this.subjectsService.getSubjectById(subjectId);

    if (!subjectRecord) {
      throw new NotFoundException('Subject not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (subjectRecord.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this Subject');
    }

    const subjectData: TSubjectUpdateInput = { ...dto };

    const subject = await this.subjectsService.editSubject(subjectId, subjectData);

    return this.getSubjectResponse(subject);
  }

  @Delete('subject/:id')
  async deleteSubject(@GetUser('id') userId: string, @Param('id') subjectId: string): Promise<{ status: string }> {
    const subjectRecord = await this.subjectsService.getSubjectById(subjectId);

    if (!subjectRecord) {
      throw new NotFoundException('Subject not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (subjectRecord.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this Subject');
    }

    await this.subjectsService.deleteSubject(subjectId);

    return { status: 'Success' };
  }

  @Patch('subject/:id/semesters')
  async addSubjectToSemester(
    @GetUser('id') userId: string,
    @Param('id') subjectId: string,
    @Body() dto: SubjectToSemesterAPIDto,
  ): Promise<ResponseSubjectAPIDto> {
    const subjectRecord = await this.subjectsService.getSubjectById(subjectId);

    if (!subjectRecord) {
      throw new NotFoundException('Subject not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    const disSemester = subjectRecord.semesters.map((semester) => {
      return semester.semesterId;
    });

    if (subjectRecord.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this Subject');
    }

    const validSemesters = await this.auxService.getValidSemestersIds(dto.semesters);

    const semesters = validSemesters
      .map((semesterId) => {
        if (disSemester.includes(semesterId)) {
          return null;
        }

        return semesterId;
      })
      .filter((x) => x != null);

    if (semesters.length === 0) {
      throw new BadRequestException('No valid Semesters to add to Subject');
    }

    const subject = await this.subjectsService.addSubjectToSemesters(subjectId, semesters);

    return this.getSubjectResponse(subject);
  }

  @Delete('subject/:id/semesters')
  async removeSubjectFromSemester(
    @GetUser('id') userId: string,
    @Param('id') subjectId: string,
    @Body() dto: SubjectToSemesterAPIDto,
  ): Promise<ResponseSubjectAPIDto> {
    const subjectRecord = await this.subjectsService.getSubjectById(subjectId);

    if (!subjectRecord) {
      throw new NotFoundException('Subject not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    const disSemester = subjectRecord.semesters.map((semester) => {
      return semester.semesterId;
    });

    if (subjectRecord.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this Subject');
    }

    const validSemesters = await this.auxService.getValidSemestersIds(dto.semesters);

    if (validSemesters.length === 0) {
      throw new BadRequestException('No valid Semesters to add from Subject');
    }

    const semesters = validSemesters
      .map((semesterId) => {
        if (!disSemester.includes(semesterId)) {
          return null;
        }
        return semesterId;
      })
      .filter((x) => x != null);

    if (semesters.length === 0) {
      throw new BadRequestException('No valid Semesters to add from Subject');
    }

    const subject = await this.subjectsService.removeSubjectFromSemesters(subjectId, semesters);

    return this.getSubjectResponse(subject);
  }

  private getSubjectResponse(subject: TSubjectWithSemesterOutput): ResponseSubjectAPIDto {
    return {
      subjectId: subject.subjectId,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
      totalHoursWorkload: subject.totalHoursWorkload,
      praticalHoursWorkload: subject.praticalHoursWorkload,
      teoricHoursWorkload: subject.teoricHoursWorkload,
      eadHoursWorkload: subject.eadHoursWorkload,
      type: subject.type,
      name: subject.name,
      description: subject.description,
      semesters: subject.semesters.map((semester) => {
        return semester.semesterId;
      }),
      studyField: subject?.studyFieldId ?? null,
    };
  }
}
