import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AbilitiesService } from '../../../abilities/abilities.service';
import { CertificatesService } from '../../../certificates/certificates.service';
import { CoursesService } from '../../../courses/courses.service';
import { DateFormat } from '../../../interceptors/dateformat.interceptor';
import { UsersService } from '../../../users/users.service';
import { CanvasGetUser } from '../decorators/get-user-canvas.decorator';
import { ResponseCanvasAbilitiesOnCertificateDto } from '../dtos/templates/canvas-templates-response.dto';
import { ResponseCanvasPlatformUserInfoDto } from '../dtos/user/canvas-user-response.dto';
import { CanvasJwtGuard } from '../guards/canvas-jwk.guard';
import { ICanvasUserData } from '../interfaces/canvas-platform.interfaces';

@ApiTags('Canvas Platform -- User')
@Controller('canvas-platform')
@UseGuards(CanvasJwtGuard)
export class CanvasUserController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly userService: UsersService,
    private readonly abilitiesService: AbilitiesService,
    private readonly certificatesService: CertificatesService,
  ) {}

  @UseInterceptors(new DateFormat(['createdAt']))
  @Get('/info')
  async getCanvasUserInfo(@CanvasGetUser() canvasUser: ICanvasUserData): Promise<ResponseCanvasPlatformUserInfoDto> {
    const course = await this.coursesService.getCourseWithTemplates(canvasUser.courseId);

    const students = await this.userService.getAllCoursesStudents([canvasUser.courseId]);

    const certificates = await this.certificatesService.getCertificatesByCourseId(canvasUser.courseId);

    return {
      courseName: course.name,
      totalStudents: students.length,
      verifiedStudents: students.filter((student) => student.tempCourse !== course.courseId).length,
      rawStudents: students.filter((student) => student.tempCourse === course.courseId).length,
      numberOfEmmitedCertificates: certificates.length,
      createdCertificates: course.templates.map((template) => {
        const templateInfo = template.template;
        return {
          templateId: templateInfo.templateId,
          createdAt: templateInfo.createdAt,
          schoolName: templateInfo.school.name,
          name: templateInfo.name,
          hoursWorkload: templateInfo.cargaHoraria,
          categories: templateInfo.habilidades.map((ability) => ability.habilidade.tema),
          imageTemplateUrl: templateInfo.certificatePicture,
        };
      }),
    };
  }

  @Get('/abilities/enabled')
  async getAllEnabledAbilities(): Promise<Array<ResponseCanvasAbilitiesOnCertificateDto>> {
    return (await this.abilitiesService.getAllEnabledAbilities()).map((ability) => {
      return {
        abilityId: ability.habilidadeId,
        ability: ability.habilidade,
        category: ability.tema,
      };
    });
  }
}
