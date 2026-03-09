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
import { AuxService } from '../../../aux/aux.service';
import { JwtGuard } from '../../../auth/guard';
import { RolesGuard } from '../../../users/guards';
import {
  TSubjectCreateInput,
  TSubjectUpdateInput,
  TSubjectWithSemesterOutput,
} from '../../../subjects/types/subjects.types';
import { GetUser } from '../../../auth/decorators';
import { Roles } from '../../../users/decorators';
import { SubjectsService } from '../../../subjects/subjects.service';
import {
  CreateSubjectPjInfoDto,
  EditSubjectPjInfoDto,
  SubjectToSemesterPjInfoDto,
} from '../../dtos/academic-structure/subjects/subjects-input.dto';
import { ResponseSubjectPjInfoDto } from '../../dtos/academic-structure/subjects/subjects-response.dto';
import { PJRoles } from 'src/pjinfo/decorators/roles-pj.decorator';
import { PJRolesGuard } from 'src/pjinfo/guards/roles-guards-pj.guard';

@ApiTags('Institutional -- Subjects')
@UseGuards(JwtGuard, RolesGuard)
@Controller('pj/:pjId')
export class SubjectsPjInfoController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly auxService: AuxService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('subjects')
  async getUserSubjects(@GetUser('id') userId: string): Promise<Array<ResponseSubjectPjInfoDto>> {
    const pj = await this.auxService.getPjInfo(userId);

    const subjects = await this.subjectsService.getUserSubjects(pj.idPJ);

    return subjects.map((subject) => this.getSubjectResponse(subject));
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Post('subject')
  async createSubject(
    @GetUser('id') userId: string,
    @Body() dto: CreateSubjectPjInfoDto,
  ): Promise<ResponseSubjectPjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const subjectData: TSubjectCreateInput = {
      ...dto,
      user: { connect: { idPJ: pj.idPJ } },
    };

    const subject = await this.subjectsService.createSubject(subjectData);

    return this.getSubjectResponse(subject);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('subject/:id')
  async getSubjectById(
    @GetUser('id') userId: string,
    @Param('id') subjectId: string,
  ): Promise<ResponseSubjectPjInfoDto> {
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

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Patch('subject/:id')
  async editSubject(
    @GetUser('id') userId: string,
    @Param('id') subjectId: string,
    @Body() dto: EditSubjectPjInfoDto,
  ): Promise<ResponseSubjectPjInfoDto> {
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

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
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

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Patch('subject/:id/semesters')
  async addSubjectToSemester(
    @GetUser('id') userId: string,
    @Param('id') subjectId: string,
    @Body() dto: SubjectToSemesterPjInfoDto,
  ): Promise<ResponseSubjectPjInfoDto> {
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

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Delete('subject/:id/semesters')
  async removeSubjectFromSemester(
    @GetUser('id') userId: string,
    @Param('id') subjectId: string,
    @Body() dto: SubjectToSemesterPjInfoDto,
  ): Promise<ResponseSubjectPjInfoDto> {
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

  private getSubjectResponse(subject: TSubjectWithSemesterOutput): ResponseSubjectPjInfoDto {
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
