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
  PreconditionFailedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../auth/decorators';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { PJRoles } from '../decorators/roles-pj.decorator';
import { PJRolesGuard } from '../guards/roles-guards-pj.guard';
import { SchoolsService } from '../../schools/schools.service';
import { AuxService } from '../../aux/aux.service';
import { TSchoolCreateInput } from '../../schools/types/schools.types';
import { CoursesService } from '../../courses/courses.service';
import { randomUUID } from 'crypto';
import {
  ResponseCreateSchoolPjInfoDto,
  ResponseSchoolPjInfoDto,
  ResponseSchoolsPjInfoDto,
} from '../dtos/schools/schools-response.dto';
import { CreateNewSchoolPjInfoDto, UpdateSchoolPjInfoDto } from '../dtos/schools/schools-input.dto';

@ApiTags('Institutional -- Schools')
@Controller('pj/:pjId')
@UseGuards(JwtGuard)
export class SchoolsInstitutionalController {
  constructor(
    private readonly schoolService: SchoolsService,
    private readonly courseService: CoursesService,
    private readonly auxService: AuxService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Post('/school')
  async createSchool(
    @GetUser('id') userId: string,
    @Body() dto: CreateNewSchoolPjInfoDto,
  ): Promise<ResponseCreateSchoolPjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const schoolRecord = await this.schoolService.getSchoolByCnpj(dto.document);

    if (schoolRecord) {
      throw new PreconditionFailedException(`CNPJ already exists on school ${schoolRecord.name}`);
    }

    const { document: _document, courses, phone, website, ...rest } = dto;

    const schoolData: TSchoolCreateInput = {
      //TODO: FIX AFTER UPDATING CONTRACT;
      phoneNumber: phone,
      homepageUrl: website,
      //
      ...rest,
      schoolCnpj: dto.document,
      logoImage: null,
      userId: { connect: { idPJ: pj.idPJ } },
      courses: { createMany: { data: [] } },
    };

    if (courses) {
      const coursesIds: Array<{ courseId: string }> = [];
      await this.courseService.getCreateCourseFromArray(
        courses.map((course) => {
          const courseId = randomUUID();
          coursesIds.push({ courseId: courseId });
          return {
            //TODO: UNCOMENT AFTER FIXING CONTRACT
            //...course,
            courseId: courseId,
            idPj: pj.idPJ,
            name: course.name,
            description: course.description,
            level: course.level,
          };
        }),
      );

      schoolData.courses.createMany.data = coursesIds;
    }

    await this.schoolService.createSchool(schoolData);

    return {
      statusCode: 201,
      status: 'Success',
      response: {
        message: 'Unidade de Ensino Cadastrada com sucesso',
      },
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('/schools')
  async getSchools(@GetUser('id') userId: string): Promise<ResponseSchoolsPjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const schools = await this.schoolService.getAllUserSchools(pj.idPJ);

    return {
      statusCode: 200,
      status: 'Success',
      response: {
        data: schools.map((school) => {
          return {
            id: school.schoolId,
            name: school.name,
            email: school.email,
            phone: school.phoneNumber,
            document: school.schoolCnpj,
            website: school.homepageUrl,
            description: school.description,
          };
        }),
      },
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('/school/:schoolId')
  async getSchool(
    @GetUser('id') userId: string,
    @Param('schoolId') schoolId: string,
  ): Promise<ResponseSchoolPjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const school = await this.schoolService.getSchoolById(schoolId);

    if (!school) {
      throw new NotFoundException('School Not Found');
    }

    if (pj.idPJ != school.ownerUserId) {
      throw new ForbiddenException('This user does not own this school');
    }

    return {
      statusCode: 200,
      status: 'Success',
      response: {
        data: {
          id: school.schoolId,
          name: school.name,
          email: school.email,
          phone: school.phoneNumber,
          document: school.schoolCnpj,
          website: school.homepageUrl,
          description: school.description,
        },
      },
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Patch('/school/:schoolId')
  async editSchool(
    @GetUser('id') userId: string,
    @Param('schoolId') schoolId: string,
    @Body() dto: UpdateSchoolPjInfoDto,
  ): Promise<ResponseSchoolPjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const schoolInfo = await this.schoolService.getSchoolById(schoolId);

    if (!schoolInfo) {
      throw new NotFoundException('School Not Found');
    }

    if (schoolInfo.isCanvas) {
      throw new ForbiddenException('This school cannot be edited');
    }

    if (pj.idPJ != schoolInfo.ownerUserId) {
      throw new ForbiddenException('This user does not own this school');
    }

    //TODO: FIX THIS AFTER UPDATING CONTRACT
    //const updateData = dto ;

    const { website, phone, ...rest } = dto;
    const updateData = {
      homepageUrl: website,
      phoneNumber: phone,
      ...rest,
    };

    const school = await this.schoolService.editSchool(schoolId, updateData);

    return {
      statusCode: 200,
      status: 'Success',
      response: {
        data: {
          id: school.schoolId,
          name: school.name,
          email: school.email,
          phone: school.phoneNumber,
          document: school.schoolCnpj,
          website: school.homepageUrl,
          description: school.description,
        },
      },
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Delete('/school/:schoolId')
  async deleteSchool(
    @GetUser('id') userId: string,
    @Param('schoolId') schoolId: string,
  ): Promise<{ success: boolean }> {
    const pj = await this.auxService.getPjInfo(userId);

    const schoolInfo = await this.schoolService.getSchoolById(schoolId);

    if (!schoolInfo) {
      throw new NotFoundException('School Not Found');
    }

    if (pj.idPJ != schoolInfo.ownerUserId) {
      throw new ForbiddenException('This user does not own this school');
    }

    if (schoolInfo.isCanvas) {
      throw new ForbiddenException('This school cannot be deleted');
    }

    await this.schoolService.deleteSchool(schoolId);

    return { success: true };
  }
}
