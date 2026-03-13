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
import { TActivitesAndCurriculumOutput, TActivitiesCreateInput } from '../../activities/types/activities.types';
import { AuxService } from '../../_aux/_aux.service';
import { ActivitiesService } from '../../activities/activities.service';
import { GetUser } from '../../auth/decorators';
import { CreateActivityAPIDto, EditActivityAPIDto } from '../dtos/activities/activities-input.dto';
import { ResponseActivityAPIDto } from '../dtos/activities/activities-response.dto';
import { ApiKeyGuard } from '../guards/api_secret.guard';

@ApiTags('API Activities')
@UseGuards(ApiKeyGuard)
@Controller('api/v1')
export class ActivitiesAPIController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly auxService: AuxService,
  ) {}

  @Get('activity')
  async getPjUserActivities(@GetUser() user: User): Promise<Array<ResponseActivityAPIDto>> {
    const pj = await this.auxService.getPjInfo(user.id);

    if (!pj) {
      throw new NotFoundException('Pj not found.');
    }

    const activities = await this.activitiesService.getPjUserActivities(pj.idPJ);

    return activities.map((activity) => this.getActivityResponse(activity));
  }

  @Post('activity')
  async createActivity(@GetUser() user: User, @Body() dto: CreateActivityAPIDto): Promise<ResponseActivityAPIDto> {
    const pj = await this.auxService.getPjInfo(user.id);

    const { studyField, curriculums, ...rest } = dto;

    const data: TActivitiesCreateInput = {
      ...rest,
      user: { connect: { userId: pj.idPJ } },
    };

    const activity = await this.activitiesService.createActivity(pj.idPJ, data, studyField, curriculums);

    return this.getActivityResponse(activity);
  }

  @Patch('activity/:id')
  async editActivity(
    @GetUser() user: User,
    @Param('id') activityId: string,
    @Body() dto: EditActivityAPIDto,
  ): Promise<ResponseActivityAPIDto> {
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

  @Get('activity/:id')
  async getActivityById(@GetUser() user: User, @Param('id') activityId: string): Promise<ResponseActivityAPIDto> {
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

  private getActivityResponse(activity: TActivitesAndCurriculumOutput): ResponseActivityAPIDto {
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
