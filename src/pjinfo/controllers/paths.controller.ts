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
import { Roles } from 'src/users/decorators';
import { RolesGuard } from 'src/users/guards';
import { CreateOrUpdateLearningPathPjInfoDto } from '../dtos/learning-paths/paths-input.dto';
import {
  LearningPathResponsePjInfoDto,
  LearningPathsResponsePjInfoDto,
} from '../dtos/learning-paths/paths-response.dto';
import { LearningPathService } from '../../learning-paths/path.service';
import { GetUser } from 'src/auth/decorators';
import { AuxService } from 'src/_aux/_aux.service';
import {
  TCreateLearningPathInput,
  TLearningPath,
  TUpdateLearningPathInput,
} from 'src/learning-paths/types/paths.types';
import { TemplatesService } from 'src/templates/templates.service';
import { PJRoles } from '../decorators/roles-pj.decorator';
import { PJRolesGuard } from '../guards/roles-guards-pj.guard';
import { JwtGuard } from 'src/auth/guard';

@ApiTags('Institutional -- Learning Paths')
@UseGuards(JwtGuard)
@Controller('pj/:pjId/paths')
export class LearningPathPjInfoController {
  constructor(
    private readonly auxService: AuxService,
    private readonly learningPathService: LearningPathService,
    private readonly templatesService: TemplatesService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('review')
  @PJRoles('basico')
  @Get()
  async getLearningPaths(@GetUser('id') userId: string): Promise<LearningPathsResponsePjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const learningPaths = await this.learningPathService.getPjLearningPaths(pj.idPJ);

    return {
      paths: learningPaths.map((p) => this.getLearningPathRespose(p)),
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('review')
  @PJRoles('basico')
  @Get(':pathId')
  async getLearningPath(
    @GetUser('id') userId: string,
    @Param('pathId') pathId: string,
  ): Promise<LearningPathResponsePjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const learningPath = await this.learningPathService.getLearningPathById(pathId);

    if (!learningPath) {
      throw new NotFoundException('Learning Path not found.');
    }

    if (learningPath.pjId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this learning Path');
    }

    return this.getLearningPathRespose(learningPath);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('review')
  @PJRoles('basico')
  @Post()
  async createLearningPath(
    @GetUser('id') userId: string,
    @Body() dto: CreateOrUpdateLearningPathPjInfoDto,
  ): Promise<LearningPathResponsePjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const data: TCreateLearningPathInput = {
      name: dto.name,
      description: dto.description,
      owner: { connect: { idPJ: pj.idPJ } },
      modules: {
        createMany: {
          data: dto.modules.map((m) => {
            return { moduleIndex: m.index };
          }),
        },
      },
    };

    if (dto.templateId) {
      const template = await this.templatesService.checkTemplateById(dto.templateId);

      if (!template) {
        throw new NotFoundException('Template not Found');
      }

      if (template.idPj != pj.idPJ) {
        throw new ForbiddenException('This user does not own this template.');
      }

      data.templates = { connect: { templateId: dto.templateId } };
    }

    const learningPath = await this.learningPathService.createLearningPath(data);

    const pathId = await this.learningPathService.associateModuleChildren(learningPath.pathId, dto.modules);

    const updatedLearningPath = await this.learningPathService.getLearningPathById(pathId);

    return this.getLearningPathRespose(updatedLearningPath);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('review')
  @PJRoles('basico')
  @Patch(':pathId')
  async updateLearningPath(
    @GetUser('id') userId: string,
    @Body() dto: CreateOrUpdateLearningPathPjInfoDto,
    @Param('pathId') pathId: string,
  ): Promise<LearningPathResponsePjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    if (!pj) {
      throw new ForbiddenException('User is not PJ');
    }

    if (!(await this.learningPathService.checkLearningPathById(pathId))) {
      throw new NotFoundException('Learning Path not found.');
    }

    await this.learningPathService.deleteLearningPathModules(pathId);
    const data: TUpdateLearningPathInput = {
      name: dto.name,
      description: dto.description,
      modules: {
        createMany: {
          data: dto.modules.map((m) => {
            return { moduleIndex: m.index };
          }),
        },
      },
    };

    if (dto.templateId) {
      const template = await this.templatesService.checkTemplateById(dto.templateId);

      if (!template) {
        throw new NotFoundException('Template not Found');
      }

      if (template.idPj != pj.idPJ) {
        throw new ForbiddenException('This user does not own this template.');
      }

      data.templates = { connect: { templateId: dto.templateId } };
    }

    const newPathId = await this.learningPathService.updateLearningPath(pathId, data);
    await this.learningPathService.associateModuleChildren(newPathId, dto.modules);

    const updatedLearningPath = await this.learningPathService.getLearningPathById(newPathId);

    return this.getLearningPathRespose(updatedLearningPath);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('review')
  @PJRoles('basico')
  @Delete(':pathId')
  async deleteLearningPath(
    @GetUser('id') userId: string,
    @Param('pathId') pathId: string,
  ): Promise<{ success: boolean }> {
    const pj = await this.auxService.getPjInfo(userId);

    const learningPath = await this.learningPathService.getLearningPathById(pathId);

    if (!learningPath) {
      throw new NotFoundException('Learning Path not found.');
    }

    if (learningPath.pjId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this learning Path');
    }

    await this.learningPathService.deleteLearningPath(pathId);

    return { success: true };
  }

  private getLearningPathRespose(path: TLearningPath): LearningPathResponsePjInfoDto {
    return {
      pathId: path.pathId,
      name: path.name,
      description: path.description,
      createdAt: path.createdAt,
      totalHoursWorkload: path.totalHoursWorkload,
      templateId: path.templateId,
      totalModules: path.modules.length,
      studentsCompleted: path.participants.filter((s) => s.completed).length,
      totalStudents: path.participants.length,
      students: path.participants.map((s) => {
        return {
          enrollDate: s.createdAt,
          name: s.student.nome,
          completed: s.completed,
          completedAt: s.completedAt,
          idPf: s.student.idPF,
          modulesCompleted: s.modules.map((m) => m.moduleId),
        };
      }),
      modules: path.modules.map((step) => {
        return {
          moduleId: step.moduleId,
          moduleIndex: step.moduleIndex,
          subjects: step.subjects.map((s) => {
            const i = s.subject;
            return {
              id: i.subjectId,
              name: i.name,
              description: i.description,
              totalHoursWorkload: i.totalHoursWorkload,
              templateId: i.templateId,
              completedQty: i.students.filter((s) => s.completed).length,
              completedBy: i.students
                .filter((s) => s.completed)
                .map((s) => {
                  return {
                    completeDate: s.completedAt,
                    name: s.student.nome,
                    idPf: s.idPf,
                  };
                }),
            };
          }),
          activities: step.activities.map((s) => {
            const i = s.activity;
            return {
              id: i.activityId,
              name: i.name,
              description: i.description,
              totalHoursWorkload: i.hoursWorkload,
              templateId: i.templateId,
              completedQty: i.students.filter((s) => s.completed).length,
              completedBy: i.students
                .filter((s) => s.completed)
                .map((s) => {
                  return {
                    completeDate: s.completedAt,
                    name: s.student.nome,
                    idPf: s.idPf,
                  };
                }),
            };
          }),
          internships: step.internships.map((s) => {
            const i = s.internship;
            return {
              id: i.internshipId,
              name: i.name,
              description: i.description,
              totalHoursWorkload: i.hoursWorkload,
              templateId: i.templateId,
              completedQty: i.students.filter((s) => s.completed).length,
              completedBy: i.students
                .filter((s) => s.completed)
                .map((s) => {
                  return {
                    completeDate: s.completedAt,
                    name: s.student.nome,
                    idPf: s.idPf,
                  };
                }),
            };
          }),
          events: step.institutionalEvents.map((s) => {
            const i = s.institutionalEvents;
            return {
              id: i.institutionalEventId,
              name: i.name,
              description: i.description,
              totalHoursWorkload: i.hoursWorkload,
              templateId: i.templateId,
              completedQty: i.students.filter((s) => s.completed).length,
              completedBy: i.students
                .filter((s) => s.completed)
                .map((s) => {
                  return {
                    completeDate: s.completedAt,
                    name: s.student.nome,
                    idPf: s.idPf,
                  };
                }),
            };
          }),
        };
      }),
    };
  }
}
