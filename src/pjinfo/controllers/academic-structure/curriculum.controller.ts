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
import { ActivitiesService } from '../../../activities/activities.service';
import { AuxService } from '../../../aux/aux.service';
import { TCurriculumCreateInput, TCurriculumWithAllOutput } from '../../../curriculums/types/curriculum.types';
import { InternshipsService } from '../../../internships/internships.service';
import { TSemesterCreateWithoutCurriculumInput } from '../../../semesters/types/semesters.types';
import { SubjectsService } from '../../../subjects/subjects.service';
import { GetUser } from '../../../auth/decorators';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/users/guards';
import { Roles } from 'src/users/decorators';
import { CurriculumsService } from '../../../curriculums/curriculums.service';
import {
  AddCurriculumPjInfoDto,
  CreateCurriculumPjInfoDto,
  EditCurriculumPjInfoDto,
} from '../../dtos/academic-structure/curriculums/curriculums-input.dto';
import { ResponseCurriculumPjInfoDto } from '../../dtos/academic-structure/curriculums/curriculums-response.dto';
import { PJRoles } from 'src/pjinfo/decorators/roles-pj.decorator';
import { PJRolesGuard } from 'src/pjinfo/guards/roles-guards-pj.guard';

@ApiTags('Institutional --  Curriculums')
@UseGuards(JwtGuard)
@Controller('pj/:pjId')
export class CurriculumsPjInfoController {
  constructor(
    private readonly curriculumService: CurriculumsService,
    private readonly auxService: AuxService,
    private readonly activitiesService: ActivitiesService,
    private readonly internshipService: InternshipsService,
    private readonly subjectsService: SubjectsService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('curriculums/:curriculumId')
  async getCurriculum(
    @GetUser('id') userId: string,
    @Param('curriculumId') curriculumId: string,
  ): Promise<ResponseCurriculumPjInfoDto> {
    const curriculum = await this.curriculumService.getCurriculum(curriculumId);

    if (!curriculum) {
      throw new NotFoundException('No Curriculum found');
    }

    const ownersIds = curriculum.course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    const pj = await this.auxService.getPjInfo(userId);

    if (!ownersIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    return this.getCurriculumResponse(curriculum);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('course/:courseId/curriculums')
  async getCurriculums(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
  ): Promise<Array<ResponseCurriculumPjInfoDto>> {
    const curriculums = await this.curriculumService.getCourseCurriculums(courseId);

    if (curriculums.length === 0) {
      throw new NotFoundException('No Curriculums found');
    }

    const ownersIds = curriculums[0].course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    const pj = await this.auxService.getPjInfo(userId);

    if (!ownersIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    return curriculums.map((curriculum) => {
      return this.getCurriculumResponse(curriculum);
    });
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Post('curriculum/:courseId')
  async createCurriculum(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Body() dto: CreateCurriculumPjInfoDto,
  ): Promise<ResponseCurriculumPjInfoDto> {
    const course = await this.curriculumService.getCourse(courseId);

    if (!course) {
      throw new NotFoundException('Course Not Found');
    }

    if (!course.isAcademic) {
      throw new BadRequestException('This course is not academic');
    }

    const ownersIds = course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    const pj = await this.auxService.getPjInfo(userId);

    if (!ownersIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const { activities, internships, semesters, ...rest } = dto;

    const curriculumsInfo: TCurriculumCreateInput = {
      ...rest,
      course: { connect: { courseId: courseId } },
    };

    const semestersData: Array<TSemesterCreateWithoutCurriculumInput> = [];
    if (semesters) {
      const semestersIndex = semesters.map((s) => s.semesterNumber);
      const set = new Set(semestersIndex);
      if (semestersIndex.length > set.size) {
        throw new BadRequestException('Semesters numbers must not be duplicate.');
      }

      const p = semesters.map(async (semester) => {
        const { subjects, ...semesterInfo } = semester;
        const semesterData: TSemesterCreateWithoutCurriculumInput = {
          semesterId: randomUUID(),
          ...semesterInfo,
        };

        if (subjects?.length > 0) {
          const subjectIds = await this.subjectsService.getCreateSubjectsFromArray(
            semester.subjects.map((subject) => {
              const subjectId = randomUUID();
              return {
                subjectId: subjectId,
                idPj: pj.idPJ,
                ...subject,
              };
            }),
          );

          semesterData.subjects = {
            create: subjectIds.map((s) => {
              return {
                semesterSubjectId: randomUUID(),
                subject: {
                  create: s,
                },
              };
            }),
          };
        }

        semestersData.push(semesterData);
      });

      await Promise.all(p);
      curriculumsInfo.semesters = { create: semestersData };
    }

    if (activities) {
      const activityIds = await this.activitiesService.getCreateActivityFromArray(
        activities.map((activity) => {
          const activityId = randomUUID();
          return {
            activityId: activityId,
            idPj: pj.idPJ,
            ...activity,
          };
        }),
      );

      curriculumsInfo.activities = {
        create: activityIds.map((activity) => {
          return {
            semesterEstagioId: randomUUID(),
            activity: {
              create: activity,
            },
          };
        }),
      };
    }

    console.log(JSON.stringify(curriculumsInfo), 'activities');

    if (internships) {
      const internshipsIds = await this.internshipService.getCreateInternshipsFromArray(
        internships.map((internship) => {
          const internshipId = randomUUID();
          return {
            internshipId: internshipId,
            idPj: pj.idPJ,
            ...internship,
          };
        }),
      );

      curriculumsInfo.internships = {
        create: internshipsIds.map((internship) => {
          return {
            semesterEstagioId: randomUUID(),
            internship: {
              create: internship,
            },
          };
        }),
      };
    }

    console.log(JSON.stringify(curriculumsInfo), 'activites');

    const curriculum = await this.curriculumService.createCurriculum(curriculumsInfo);
    return this.getCurriculumResponse(curriculum);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Patch('curriculum/:curriculumId')
  async editCurriculum(
    @GetUser('id') userId: string,
    @Param('curriculumId') curriculumId: string,
    @Body() dto: EditCurriculumPjInfoDto,
  ): Promise<ResponseCurriculumPjInfoDto> {
    const curriculumInfo = await this.curriculumService.getCurriculum(curriculumId);

    if (!curriculumInfo) {
      throw new NotFoundException('Curriculum No Found');
    }
    const ownersIds = curriculumInfo.course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    const pj = await this.auxService.getPjInfo(userId);

    if (!ownersIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }
    const curriculum = await this.curriculumService.editCurriculum(curriculumId, dto);

    return this.getCurriculumResponse(curriculum);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Delete('curriculum/:curriculumId')
  async deleteCurriculum(
    @GetUser('id') userId: string,
    @Param('curriculumId') curriculumId: string,
  ): Promise<{ success: boolean }> {
    const curriculumInfo = await this.curriculumService.getCurriculum(curriculumId);

    if (!curriculumInfo) {
      throw new NotFoundException('Curriculum No Found');
    }
    const ownersIds = curriculumInfo.course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    const pj = await this.auxService.getPjInfo(userId);

    if (!ownersIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    await this.curriculumService.deleteCurriculum(curriculumId);
    return { success: true };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Patch('curriculum/:curriculumId/activities')
  async addActivitiesToCurriculum(
    @GetUser('id') userId: string,
    @Param('curriculumId') curriculumId: string,
    @Body() dto: AddCurriculumPjInfoDto,
  ): Promise<ResponseCurriculumPjInfoDto> {
    const curriculumInfo = await this.curriculumService.getCurriculum(curriculumId);

    if (!curriculumInfo) {
      throw new NotFoundException('Curriculum No Found');
    }
    const ownersIds = curriculumInfo.course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    const pj = await this.auxService.getPjInfo(userId);

    if (!ownersIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const validActivityIds = await this.auxService.getValidAbilityIds(dto.ids);

    if (validActivityIds.length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    const linkedActivities = curriculumInfo.activities.map((activity) => activity.activityId);

    const activityIds = validActivityIds
      .map((activityId) => {
        if (!linkedActivities.includes(activityId)) {
          return null;
        }
        return activityId;
      })
      .filter((x) => x != null);

    if (activityIds.length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    const curriculum = await this.curriculumService.addActivitiesToCurriculum(curriculumId, activityIds);

    return this.getCurriculumResponse(curriculum);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Patch('curriculum/:curriculumId/internships')
  async addInternshipsToCurriculum(
    @GetUser('id') userId: string,
    @Param('curriculumId') curriculumId: string,
    @Body() dto: AddCurriculumPjInfoDto,
  ): Promise<ResponseCurriculumPjInfoDto> {
    const curriculumInfo = await this.curriculumService.getCurriculum(curriculumId);

    if (!curriculumInfo) {
      throw new NotFoundException('Curriculum No Found');
    }
    const ownersIds = curriculumInfo.course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    const pj = await this.auxService.getPjInfo(userId);

    if (!ownersIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const validInternshipsIds = await this.auxService.getValidInternshipIds(dto.ids);

    if (validInternshipsIds.length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    const linkedInternships = curriculumInfo.internships.map((internship) => internship.internshipId);

    const internshipsIds = validInternshipsIds
      .map((internshipId) => {
        if (!linkedInternships.includes(internshipId)) {
          return null;
        }
        return internshipId;
      })
      .filter((x) => x != null);

    if (internshipsIds.length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    const curriculum = await this.curriculumService.addInternshipsToCurriculum(curriculumId, internshipsIds);

    return this.getCurriculumResponse(curriculum);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Delete('curriculum/:curriculumId/activities')
  async removeActivitiesFromCurriculum(
    @GetUser('id') userId: string,
    @Param('curriculumId') curriculumId: string,
    @Body() dto: AddCurriculumPjInfoDto,
  ): Promise<ResponseCurriculumPjInfoDto> {
    const curriculumInfo = await this.curriculumService.getCurriculum(curriculumId);

    if (!curriculumInfo) {
      throw new NotFoundException('Curriculum No Found');
    }
    const ownersIds = curriculumInfo.course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    const pj = await this.auxService.getPjInfo(userId);

    if (!ownersIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const validActivityIds = await this.auxService.getValidAbilityIds(dto.ids);

    if (validActivityIds.length === 0) {
      throw new BadRequestException('No valid fields to remove');
    }

    const linkedActivities = curriculumInfo.activities.map((activity) => activity.activityId);

    const activityIds = validActivityIds
      .map((activityId) => {
        if (!linkedActivities.includes(activityId)) {
          return null;
        }
        return activityId;
      })
      .filter((x) => x != null);

    if (activityIds.length === 0) {
      throw new BadRequestException('No valid fields to remove');
    }

    const curriculum = await this.curriculumService.removeActivitiesFromCurriculum(curriculumId, activityIds);

    return this.getCurriculumResponse(curriculum);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Delete('curriculum/:curriculumId/internships')
  async removeInternshipsFromCurriculum(
    @GetUser('id') userId: string,
    @Param('curriculumId') curriculumId: string,
    @Body() dto: AddCurriculumPjInfoDto,
  ): Promise<ResponseCurriculumPjInfoDto> {
    const curriculumInfo = await this.curriculumService.getCurriculum(curriculumId);

    if (!curriculumInfo) {
      throw new NotFoundException('Curriculum No Found');
    }
    const ownersIds = curriculumInfo.course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    const pj = await this.auxService.getPjInfo(userId);

    if (!ownersIds.includes(pj.idPJ)) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const validInternshipsIds = await this.auxService.getValidInternshipIds(dto.ids);

    if (validInternshipsIds.length === 0) {
      throw new BadRequestException('No valid fields to remove');
    }

    const linkedInternships = curriculumInfo.internships.map((internship) => internship.internshipId);

    const internshipsIds = validInternshipsIds
      .map((internshipId) => {
        if (!linkedInternships.includes(internshipId)) {
          return null;
        }
        return internshipId;
      })
      .filter((x) => x != null);

    if (internshipsIds.length === 0) {
      throw new BadRequestException('No valid fields to remove');
    }

    const curriculum = await this.curriculumService.removeInternshipsFromCurriculum(curriculumId, internshipsIds);

    return this.getCurriculumResponse(curriculum);
  }

  private getCurriculumResponse(curriculum: TCurriculumWithAllOutput): ResponseCurriculumPjInfoDto {
    return {
      curriculumId: curriculum.curriculumId,
      name: curriculum.name,
      description: curriculum.description,
      requiredHoursWorkload: curriculum.requiredHoursWorkload,
      electiveHoursWorkload: curriculum.electiveHoursWorkload,
      complementaryHoursWorkload: curriculum.complementaryHoursWorkload,
      activities:
        curriculum?.activities.map((activityMap) => {
          const activity = activityMap.activity;
          return {
            activityId: activity.activityId,
            createdAt: activity.createdAt,
            updatedAt: activity.updatedAt,
            name: activity.name,
            description: activity.description,
            hoursWorkload: activity.hoursWorkload,
            studyField: activity?.studyFieldId ?? null,
          };
        }) ?? [],

      internships:
        curriculum?.internships.map((internshipMap) => {
          const internship = internshipMap.internship;
          return {
            internshipId: internship.internshipId,
            createdAt: internship.createdAt,
            updatedAt: internship.updatedAt,
            name: internship.name,
            description: internship.description,
            hoursWorkload: internship.hoursWorkload,
            studyField: internship?.studyFieldId ?? null,
          };
        }) ?? [],
      semesters:
        curriculum?.semesters.map((semester) => {
          return {
            semesterId: semester.semesterId,
            createdAt: semester.createdAt,
            updatedAt: semester.updatedAt,
            semesterNumber: semester.semesterNumber,
            requiredHoursWorkload: semester.requiredHoursWorkload,
            electiveHoursWorkload: semester.electiveHoursWorkload,
            complementaryHoursWorkload: semester.electiveHoursWorkload,
            subjects:
              semester?.subjects.map((subjectMap) => {
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
              }) ?? [],
          };
        }) ?? [],
    };
  }
}
