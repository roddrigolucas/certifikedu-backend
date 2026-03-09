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
import { User } from '@prisma/client';
import { AcademicCredentialsService } from '../../academic-credentials/academic-credentials.service';
import { TAcademicCredentialsCreateInput } from '../../academic-credentials/types/academic-credentials.types';
import { AuxService } from '../../aux/aux.service';
import {
  TCourseCreateInput,
  TCourseUpdateInput,
  TCourseWithCredentialsOutput,
} from '../../courses/types/courses.types';
import { CurriculumsService } from '../../curriculums/curriculums.service';
import { TCurriculumWithAllOutput } from '../../curriculums/types/curriculum.types';
import { GetUser } from '../../auth/decorators';
import { CoursesService } from '../../courses/courses.service';
import { CreateCourseAPIDto, EditCourseAPIDto } from '../dtos/courses/courses-input.dto';
import { ResponseCourseAPIDto } from '../dtos/courses/courses-response.dto';
import { ResponseCurriculumAPIDto } from '../dtos/curriculums/curriculums-response.dto';
import { ApiKeyGuard } from '../guards/api_secret.guard';

@ApiTags('API Courses')
@UseGuards(ApiKeyGuard)
@Controller('api/v1')
export class CoursesAPIController {
  constructor(
    private readonly courseService: CoursesService,
    private readonly auxService: AuxService,
    private readonly curriculumsService: CurriculumsService,
    private readonly academicCredentialsService: AcademicCredentialsService,
  ) {}

  @Get('course/:courseId')
  async getCourse(@GetUser() user: User, @Param('courseId') courseId: string): Promise<ResponseCourseAPIDto> {
    const course = await this.courseService.getCourseWithCredentialsById(courseId);

    if (!course) {
      throw new NotFoundException('Course Not Found');
    }

    const pj = await this.auxService.getPjInfo(user.id);

    if (course.userId != pj.idPJ)
      throw new ForbiddenException('Frobidden Resource, this user does not own this course');

    return this.getCourseResponse(course);
  }

  @Post('course/:schoolId')
  async createCourse(
    @GetUser('id') userId: string,
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateCourseAPIDto,
  ): Promise<ResponseCourseAPIDto> {
    const school = await this.courseService.getSchool(schoolId);

    if (!school) {
      throw new NotFoundException('School not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (school.ownerUserId !== pj.idPJ) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const courseData: TCourseCreateInput = {
      name: dto.name,
      description: dto.description,
      educationLevel: dto.educationLevel,
      user: {
        connect: { idPJ: pj.idPJ },
      },
      schools: {
        create: { schoolId: schoolId },
      },
    };

    if (dto?.canvasCourseId) {
      courseData.canvasCourseId = dto.canvasCourseId ?? null;
    }

    if (dto?.credentials) {
      const credentialsData: TAcademicCredentialsCreateInput = {
        ...dto.credentials,
        user: { connect: { userId: pj.idPJ } },
      };

      const credentials = await this.academicCredentialsService.createCredentials(credentialsData);

      courseData.academicCredentials.connect.credentialId = credentials.credentialId;
    }

    const course = await this.courseService.createCourse(courseData);

    return this.getCourseResponse(course);
  }

  @Patch('course/:courseId')
  async editCourse(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Body() dto: EditCourseAPIDto,
  ): Promise<ResponseCourseAPIDto> {
    if (Object.entries(dto).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const courseInfo = await this.courseService.getCourseById(courseId);

    if (!courseInfo) {
      throw new NotFoundException('School not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (courseInfo.userId !== pj.idPJ) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const courseData: TCourseUpdateInput = {
      ...dto,
    };

    const course = await this.courseService.editCourse(courseId, courseData);

    return this.getCourseResponse(course);
  }

  @Delete('course/:courseId')
  async deleteCourse(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
  ): Promise<{ success: boolean }> {
    const courseInfo = await this.courseService.getCourseById(courseId);

    if (!courseInfo) {
      throw new NotFoundException('Course not found.');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (courseInfo.userId != pj.idPJ) {
      throw new ForbiddenException('Forbidden Resource');
    }

    await this.courseService.deleteCourse(courseId);

    return { success: true };
  }

  @Patch('/course/:id/credentials/:credentialId')
  async addCourseCredentials(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Param('credentialId') credentialId: string,
  ): Promise<ResponseCourseAPIDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const courseInfo = await this.courseService.getCourseWithCredentialsById(courseId);

    if (!courseInfo) {
      throw new NotFoundException('Course not found.');
    }

    if (!(courseInfo.userId == pj.idPJ)) {
      throw new ForbiddenException('This user is not the owner of this course.');
    }

    if (courseInfo?.academicCredentials) {
      throw new BadRequestException('course already has credentials');
    }

    const course = await this.courseService.addCourseCredentials(courseId, credentialId);
    return await this.getCourseResponse(course);
  }

  @Get('school/:schoolId/courses/')
  async getSchoolCourses(
    @GetUser('id') userId: string,
    @Param('schoolId') schoolId: string,
  ): Promise<Array<ResponseCourseAPIDto>> {
    const school = await this.courseService.getSchool(schoolId);

    if (!school) {
      throw new NotFoundException('School not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (school.ownerUserId !== pj.idPJ) {
      throw new ForbiddenException('Forbidden Resource');
    }

    const courses = await this.courseService.getCoursesBySchool(schoolId);

    return await Promise.all(courses.map(async (course) => await this.getCourseResponse(course)));
  }

  private async getCourseResponse(course: TCourseWithCredentialsOutput): Promise<ResponseCourseAPIDto> {
    return {
      courseId: course.courseId,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      schoolIds: course.schools.map((school) => {
        return school.schoolId;
      }),
      name: course.name,
      description: course?.description ?? null,
      educationLevel: course.educationLevel,
      templates: course?.templates.map((template) => {
        const templateRecord = template.template;
        return {
          templateId: templateRecord.templateId,
          createdAt: templateRecord.createdAt,
          schoolId: templateRecord.schoolId,
          description: templateRecord.description,
          name: templateRecord.name,
          hoursWorkload: templateRecord.cargaHoraria,
          abilities: templateRecord.habilidades.map((ability) => {
            return {
              category: ability.habilidade.tema,
              ability: ability.habilidade.habilidade,
            };
          }),
          issuedAt: templateRecord.issuedAt,
          expiresAt: templateRecord.expiresAt,
          imageTemplateUrl: templateRecord.certificatePicture,
        };
      }),
      credentials: course.academicCredentials
        ? {
            credentialId: course.academicCredentials.credentialId,
            createdAt: course.academicCredentials.createdAt,
            updatedAt: course.academicCredentials.updatedAt,
            emecCode: course.academicCredentials.emecCode,
            type: course.academicCredentials.type,
            number: course.academicCredentials.number,
            description: course.academicCredentials.description,
            issuedAt: course.academicCredentials.issuedAt,
            publishedDate: course.academicCredentials.publishedDate,
            publishingVehicle: course.academicCredentials.publishingVehicle,
            publishingSection: course.academicCredentials.publishingSection,
            publishingPage: course.academicCredentials.publishingPage,
            numberDOU: course.academicCredentials.numberDOU,
            credentialType: course.academicCredentials.credentialType,
          }
        : null,
      curriculums: (await this.curriculumsService.getCourseCurriculums(course.courseId)).map((curriculum) =>
        this.getCurriculumResponse(curriculum),
      ),
    };
  }

  private getCurriculumResponse(curriculum: TCurriculumWithAllOutput): ResponseCurriculumAPIDto {
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
