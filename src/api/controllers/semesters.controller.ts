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
import { randomUUID } from 'crypto';
import { AuxService } from '../../aux/aux.service';
import { TSemesterCreateInput, TSemesterWithSubjectsOutput } from '../../semesters/types/semesters.types';
import { SubjectsService } from '../../subjects/subjects.service';
import { GetUser } from '../../auth/decorators';
import { SemestersService } from '../../semesters/semesters.service';
import {
  CreateSemesterAPIDto,
  EditSemesterAPIDto,
  SubjectsToSemesterAPIDto,
} from '../dtos/semesters/semesters-input.dto';
import { ResponseSemesterAPIDto } from '../dtos/semesters/semesters-response.dto';
import { ApiKeyGuard } from '../guards/api_secret.guard';

@ApiTags('API Semesters')
@UseGuards(ApiKeyGuard)
@Controller('api/v1')
export class SemestersAPIController {
  constructor(
    private readonly semesterService: SemestersService,
    private readonly auxService: AuxService,
    private readonly subjectsService: SubjectsService,
  ) { }

  @Get('semesters/:curriculumId')
  async getSemesters(
    @GetUser('id') userId: string,
    @Param('curriculumId') curriculumId: string,
  ): Promise<Array<ResponseSemesterAPIDto>> {
    const semesters = await this.semesterService.getCurriculumSemesters(curriculumId);

    if (!semesters) {
      throw new NotFoundException('No semesters found.');
    }

    const pj = await this.auxService.getPjInfo(userId);

    const ownerIds = semesters[0].curriculum.course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    if (!ownerIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    return semesters.map((semester) => this.getSemesterResponse(semester));
  }

  @Post('semester/:curriculumId')
  async createSemester(
    @GetUser('id') userId: string,
    @Param('curriculumId') curriculumId: string,
    @Body() dto: CreateSemesterAPIDto,
  ): Promise<ResponseSemesterAPIDto> {
    const semesters = await this.semesterService.getCurriculumSemesters(curriculumId);

    if (!semesters) {
      throw new NotFoundException('No semesters found');
    }

    const semesterNumbers = semesters.map((semester) => {
      return semester.semesterNumber;
    });

    if (semesterNumbers.includes(dto.semesterNumber)) {
      throw new BadRequestException('Invalid semester number');
    }

    const pj = await this.auxService.getPjInfo(userId);

    const ownerIds = semesters[0].curriculum.course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    if (!ownerIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const { subjects, ...rest } = dto;

    const semesterInfo: TSemesterCreateInput = {
      ...rest,
      curriculum: {
        connect: { curriculumId: curriculumId },
      },
    };

    if (subjects) {
      const subjectIds: Array<{ subjectId: string }> = [];
      await this.subjectsService.getCreateSubjectsFromArray(
        subjects.map((subject) => {
          const subjectId = randomUUID();
          subjectIds.push({ subjectId: subjectId });
          return {
            subjectId: subjectId,
            idPj: pj.idPJ,
            ...subject,
          };
        }),
      );

      semesterInfo.subjects.create = subjectIds;
    }

    const semester = await this.semesterService.createSemester(semesterInfo);

    return this.getSemesterResponse(semester);
  }

  @Patch('semester/:semesterId')
  async editSemester(
    @GetUser('id') userId: string,
    @Param('semesterId') semesterId: string,
    @Body() dto: EditSemesterAPIDto,
  ): Promise<ResponseSemesterAPIDto> {
    if (Object(dto).length === 0) throw new BadRequestException('No fields to update');

    const semesterInfo = await this.semesterService.getSemester(semesterId);

    if (!semesterInfo) {
      throw new NotFoundException('Semester not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    const ownerIds = semesterInfo.curriculum.course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    if (!ownerIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const semester = await this.semesterService.editSemester(semesterId, dto);
    return this.getSemesterResponse(semester);
  }

  @Delete('semester/:semesterId')
  async deleteSemester(
    @GetUser('id') userId: string,
    @Param('semesterId') semesterId: string,
  ): Promise<{ success: boolean }> {
    const semester = await this.semesterService.getSemester(semesterId);

    if (!semester) {
      throw new NotFoundException('Semester not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    const ownerIds = semester.curriculum.course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    if (!ownerIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    await this.semesterService.deleteSemester(semesterId);

    return { success: true };
  }

  @Patch('semester/:id/subjects')
  async addSubjectsToSemester(
    @GetUser('id') userId: string,
    @Param('id') semesterId: string,
    @Body() dto: SubjectsToSemesterAPIDto,
  ): Promise<ResponseSemesterAPIDto> {
    const validSubjectIds: Array<string> = await this.auxService.getValidSubjectIds(dto.subjects);

    if (validSubjectIds.length === 0) {
      throw new BadRequestException('No fields to include');
    }
    const semesterInfo = await this.semesterService.getSemester(semesterId);

    if (!semesterInfo) {
      throw new NotFoundException('Semester not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    const ownerIds = semesterInfo.curriculum.course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    if (!ownerIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const subjectIds = validSubjectIds
      .map((subjectId) => {
        if (!semesterInfo.subjects.map((subject) => subject.subjectId).includes(subjectId)) {
          return null;
        }
        return subjectId;
      })
      .filter((x) => x != null);

    if (subjectIds.length === 0) {
      throw new BadRequestException('No valid Semesters to add from Subject');
    }

    const semester = await this.semesterService.addSubjectsToSemester(semesterId, subjectIds);
    return this.getSemesterResponse(semester);
  }

  @Delete('semester/:id/subjects')
  async removeSubjectsFromSemester(
    @GetUser('id') userId: string,
    @Param('id') semesterId: string,
    @Body() dto: SubjectsToSemesterAPIDto,
  ): Promise<ResponseSemesterAPIDto> {
    const validSubjectIds: Array<string> = await this.auxService.getValidSubjectIds(dto.subjects);

    if (validSubjectIds.length === 0) {
      throw new BadRequestException('No fields to remoe');
    }
    const semesterInfo = await this.semesterService.getSemester(semesterId);

    if (!semesterInfo) {
      throw new NotFoundException('Semester not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    const ownerIds = semesterInfo.curriculum.course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    if (!ownerIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const subjectIds = validSubjectIds
      .map((subjectId) => {
        if (!semesterInfo.subjects.map((subject) => subject.subjectId).includes(subjectId)) {
          return null;
        }
        return subjectId;
      })
      .filter((x) => x != null);

    if (subjectIds.length === 0) {
      throw new BadRequestException('No valid Semesters to add from Subject');
    }

    const semester = await this.semesterService.removeSubjectsFromSemester(semesterId, subjectIds);
    return this.getSemesterResponse(semester);
  }

  private getSemesterResponse(semester: TSemesterWithSubjectsOutput): ResponseSemesterAPIDto {
    return {
      semesterId: semester.semesterId,
      createdAt: semester.createdAt,
      updatedAt: semester.updatedAt,
      semesterNumber: semester.semesterNumber,
      requiredHoursWorkload: semester.requiredHoursWorkload,
      electiveHoursWorkload: semester.electiveHoursWorkload,
      complementaryHoursWorkload: semester.complementaryHoursWorkload,
      subjects: semester.subjects.map((subjectMap) => {
        const subject = subjectMap.subject;
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
          studyField: subject?.studyFieldId ?? '',
        };
      }),
    };
  }
}
