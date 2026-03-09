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
import { User } from '@prisma/client';
import { TActivitesAndCurriculumOutput, TActivitiesCreateInput } from '../../../activities/types/activities.types';
import { AuxService } from '../../../aux/aux.service';
import { ActivitiesService } from '../../../activities/activities.service';
import { GetUser } from '../../../auth/decorators';
import { JwtGuard } from 'src/auth/guard';
import {
  CreateActivityPjInfoDto,
  EditActivityPjInfoDto,
} from '../../dtos/academic-structure/activities/activities-input.dto';
import { ResponseActivityPjInfoDto } from '../../dtos/academic-structure/activities/activities-response.dto';
import { RolesGuard } from 'src/users/guards';
import { Roles } from 'src/users/decorators';
import { PJRoles } from 'src/pjinfo/decorators/roles-pj.decorator';
import { PJRolesGuard } from 'src/pjinfo/guards/roles-guards-pj.guard';

@ApiTags('Institutional -- Activities')
@UseGuards(JwtGuard, RolesGuard)
@Controller('pj/:pjId')
export class ActivitiesPjInfoController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly auxService: AuxService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('activity')
  async getPjUserActivities(@GetUser() user: User): Promise<Array<ResponseActivityPjInfoDto>> {
    const pj = await this.auxService.getPjInfo(user.id);

    if (!pj) {
      throw new NotFoundException('Pj not found.');
    }

    const activities = await this.activitiesService.getPjUserActivities(pj.idPJ);

    return activities.map((activity) => this.getActivityResponse(activity));
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Post('activity')
  async createActivity(
    @GetUser() user: User,
    @Body() dto: CreateActivityPjInfoDto,
  ): Promise<ResponseActivityPjInfoDto> {
    const pj = await this.auxService.getPjInfo(user.id);

    const { studyField, curriculums, ...rest } = dto;

    const data: TActivitiesCreateInput = {
      ...rest,
      user: { connect: { userId: pj.idPJ } },
    };

    const activity = await this.activitiesService.createActivity(pj.idPJ, data, studyField, curriculums);

    return this.getActivityResponse(activity);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Patch('activity/:id')
  async editActivity(
    @GetUser() user: User,
    @Param('id') activityId: string,
    @Body() dto: EditActivityPjInfoDto,
  ): Promise<ResponseActivityPjInfoDto> {
    const pj = await this.auxService.getPjInfo(user.id);

    if (!pj) {
      throw new NotFoundException('Pj not found.');
    }

    const activityData = await this.activitiesService.getActivityById(activityId);

    if (activityData.userId != pj.userId) {
      throw new ForbiddenException('This user does not own this activity.');
    }

    const activity = await this.activitiesService.editActivity(activityId, dto);

    return this.getActivityResponse(activity);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('activity/:id')
  async getActivityById(@GetUser() user: User, @Param('id') activityId: string): Promise<ResponseActivityPjInfoDto> {
    const pj = await this.auxService.getPjInfo(user.id);

    if (!pj) {
      throw new NotFoundException('Pj not found.');
    }

    const activity = await this.activitiesService.getActivityById(activityId);

    if (activity.userId != pj.userId) {
      throw new ForbiddenException('This user does not own this activity.');
    }

    return this.getActivityResponse(activity);
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Delete('activity/:id')
  async deleteActivity(@GetUser('id') userId: string, @Param('id') activityId: string): Promise<{ status: string }> {
    const pj = await this.auxService.getPjInfo(userId);

    if (!pj) {
      throw new NotFoundException('Pj not found.');
    }

    const activity = await this.activitiesService.getActivityById(activityId);

    if (activity.userId != pj.userId) {
      throw new ForbiddenException('This user does not own this activity.');
    }

    await this.activitiesService.deleteActivity(activity.activityId);

    return { status: 'Success' };
  }

  private getActivityResponse(activity: TActivitesAndCurriculumOutput): ResponseActivityPjInfoDto {
    return {
      activityId: activity.activityId,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      name: activity.name,
      description: activity.description,
      hoursWorkload: activity.hoursWorkload,
      curriculums: activity.curriculum.map((curriculum) => {
        return curriculum.curriculumId;
      }),
      studyField: activity?.studyFieldId ?? null,
    };
  }
}
