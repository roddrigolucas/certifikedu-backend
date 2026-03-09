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
import { GetUser } from '../../auth/decorators';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { PJRoles } from '../decorators/roles-pj.decorator';
import { PJRolesGuard } from '../guards/roles-guards-pj.guard';
import { AuxService } from '../../aux/aux.service';
import { CoursesService } from '../../courses/courses.service';
import { InstitutionalEventsService } from '../../institutional-events/inst-events.service';
import { TCourseCreateInput, TCourseUpdateInput } from '../../courses/types/courses.types';
import {
  ResponseCoursePjInfoDto,
  ResponseCoursesPJPjInfoDto,
  ResponseCourseStudentsPjInfoDto,
  ResponseCourseTemplatesPJPjInfoDto,
} from '../dtos/courses/courses-response.dto';
import {
  CreateCourseStudentsAssociationPjInfoDto,
  CreateOrUpdateCoursePjInfoDto,
} from '../dtos/courses/courses-input.dto';

@ApiTags('Institutional -- Courses')
@Controller('pj/:pjId')
@UseGuards(JwtGuard)
export class CoursesInstitutionalController {
  constructor(
    private readonly courseService: CoursesService,
    private readonly auxService: AuxService,
    private readonly institutionalEventService: InstitutionalEventsService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('/courses/:schoolId')
  async getCoursesBySchool(
    @GetUser('id') userId: string,
    @Param('schoolId') schoolId: string,
  ): Promise<ResponseCoursesPJPjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const schoolCourses = await this.courseService.getSchoolCourses(schoolId);

    if (!schoolCourses) {
      throw new NotFoundException('School Not Found');
    }
    if (schoolCourses.ownerUserId != pj.idPJ) {
      throw new ForbiddenException('User does not own school');
    }

    return {
      courses: schoolCourses.courses.map((relation) => {
        const course = relation.course;
        return {
          courseId: course.courseId,
          isAcademic: course.isAcademic,
          name: course.name,
          description: course.description,
          educationLevel: course.educationLevel,
          curriculums: course.curriculum,
        };
      }),
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Post('/courses/:schoolId')
  async createCourse(
    @GetUser('id') userId: string,
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateOrUpdateCoursePjInfoDto,
  ): Promise<ResponseCoursePjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    if (!dto.isAcademic) {
      await this.institutionalEventService.createInstEventByCourse(pj.idPJ, dto);
      dto.isAcademic = false;
    }

    const school = await this.courseService.getSchool(schoolId);

    if (!school) {
      throw new NotFoundException('School Not Found');
    }

    if (school.ownerUserId != pj.idPJ) {
      throw new ForbiddenException('User does not own school');
    }

    const courseData: TCourseCreateInput = {
      name: dto.name,
      description: dto.description,
      educationLevel: dto.level,
      isAcademic: dto.isAcademic,
      user: { connect: { idPJ: pj.idPJ } },
      schools: { create: { schoolId: schoolId } },
    };

    const course = await this.courseService.createCourse(courseData);

    return {
      courseId: course.courseId,
      name: course.name,
      description: course.description,
      isAcademic: course.isAcademic,
      educationLevel: course.educationLevel,
      curriculums: course.curriculum,
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Patch('/courses/:courseId')
  async editCourse(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Body() dto: CreateOrUpdateCoursePjInfoDto,
  ): Promise<ResponseCoursePjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const courseInfo = await this.courseService.getCourseById(courseId);

    if (!courseInfo) {
      throw new NotFoundException('Course Not Found');
    }

    if (!dto.isAcademic) {
      const old = {
        name: courseInfo.name,
        level: courseInfo.educationLevel,
        description: courseInfo.description,
      };

      await this.institutionalEventService.editInstEventByCourse(pj.idPJ, old, dto);
    }

    const owners = courseInfo.schools.map((school) => {
      return school.school.ownerUserId;
    });

    if (!owners.includes(pj.idPJ)) {
      throw new ForbiddenException('User does not own school');
    }

    const { level, isAcademic, ...rest } = dto;

    const courseData: TCourseUpdateInput = {
      ...rest,
      isAcademic: isAcademic ?? false,
      educationLevel: level,
    };

    const course = await this.courseService.editCourse(courseId, courseData);

    return {
      courseId: course.courseId,
      isAcademic: course.isAcademic,
      name: course.name,
      description: course.description,
      educationLevel: course.educationLevel,
      curriculums: course.curriculum,
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('/course/:courseId')
  async getCourse(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
  ): Promise<ResponseCoursePjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const course = await this.courseService.getCourseById(courseId);

    if (!course) {
      throw new NotFoundException('Course Not Found');
    }

    const owners = course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    if (!owners.includes(pj.idPJ)) {
      throw new ForbiddenException('User does not own school');
    }

    return {
      courseId: course.courseId,
      name: course.name,
      isAcademic: course.isAcademic,
      description: course.description,
      educationLevel: course.educationLevel,
      curriculums: course.curriculum,
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Delete('/courses/:courseId')
  async deleteCourse(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
  ): Promise<{ success: boolean }> {
    const pj = await this.auxService.getPjInfo(userId);

    const course = await this.courseService.getCourseById(courseId);

    if (!course) {
      throw new NotFoundException('Course Not Found');
    }

    if (!course.isAcademic) {
      await this.institutionalEventService.deleteInstEventByCourse(
        pj.idPJ,
        course.name,
        course.description,
        course.educationLevel,
      );
    }

    const owners = course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    if (!owners.includes(pj.idPJ)) {
      throw new ForbiddenException('User does not own school');
    }

    await this.courseService.deleteCourse(courseId);

    return { success: true };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('courses/:courseId/students')
  async getCourseStudents(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
  ): Promise<ResponseCourseStudentsPjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const course = await this.courseService.getCourseWithStudents(courseId);

    if (!course) {
      throw new NotFoundException('Course Not Found');
    }

    const owners = course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    if (!owners.includes(pj.idPJ)) {
      throw new ForbiddenException('User does not own school');
    }

    const studentsData = course.students.map((student) => {
      return {
        id: student.courseStudentId,
        document: student.student.CPF,
        name: student.student.nome,
        email: student.student.email,
        isTemporary: false,
      };
    });

    const rawStudents = await this.courseService.getCourseRawStudents(courseId);

    const tempStudentsData = rawStudents.map((student) => {
      return {
        id: '',
        document: student.numeroDocumento,
        name: student.tempName,
        email: student.email,
        isTemporary: true,
      };
    });

    return { students: [...studentsData, ...tempStudentsData] };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('/courses/:courseId/templates')
  async getCourseTemplates(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
  ): Promise<ResponseCourseTemplatesPJPjInfoDto> {
    const course = await this.courseService.getCourseWithTemplates(courseId);

    if (!course) throw new NotFoundException('Course Not Found');

    const owners = course.schools.map((school) => {
      return school.school.ownerUserId;
    });

    const pj = await this.auxService.getPjInfo(userId);

    if (!owners.includes(pj.idPJ)) {
      throw new ForbiddenException('User does not own school');
    }

    return {
      templates: course.templates.map((templateInfo) => {
        const template = templateInfo.template;
        return {
          templateId: template.templateId,
          courseId: course.courseId,
          schoolId: template.schoolId,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          schoolName: template.school.name,
          description: template.description,
          hidden: template.hidden,
          backgroundId: template.backgroundId,
          name: template.name,
          hoursWorkload: template.cargaHoraria,
          abilities: template.habilidades.map((ability) => {
            return {
              category: ability.habilidade.tema,
              ability: ability.habilidade.habilidade,
            };
          }),
          issuedAt: template.issuedAt,
          expiresAt: template.expiresAt,
          imageTemplateUrl: template.certificatePicture,
          logoImage: template?.logoImage ?? '',
          qrCodePosition: template.qrCodePosition,
          allowedDocuments: template.TemplatesAllowedDocuments.map((doc) => doc.document),
        };
      }),
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Post('/courses/:courseId/students')
  async addStudentToCourse(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Body() dto: CreateCourseStudentsAssociationPjInfoDto,
  ): Promise<{ success: boolean }> {
    const pj = await this.auxService.getPjInfo(userId);

    const courseInfo = await this.courseService.getCourseById(courseId);

    if (!courseInfo) {
      throw new NotFoundException('Course Not Found');
    }

    const owners = courseInfo.schools.map((school) => {
      return school.school.ownerUserId;
    });

    if (!owners.includes(pj.idPJ)) {
      throw new ForbiddenException('User does not own school');
    }

    await this.courseService.addStudentToCourse(courseId, dto.cpfs);

    return { success: true };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Delete('/courses/:courseId/students')
  async deleteStudentFromCourse(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Body() dto: CreateCourseStudentsAssociationPjInfoDto,
  ): Promise<{ success: boolean }> {
    const pj = await this.auxService.getPjInfo(userId);

    const courseInfo = await this.courseService.getCourseById(courseId);

    if (!courseInfo) {
      throw new NotFoundException('Course Not Found');
    }

    const owners = courseInfo.schools.map((school) => {
      return school.school.ownerUserId;
    });

    if (!owners.includes(pj.idPJ)) {
      throw new ForbiddenException('User does not own school');
    }

    await this.courseService.removeStudentFromCourse(courseId, dto.cpfs);

    return { success: true };
  }
}
