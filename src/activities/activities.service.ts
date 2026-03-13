import { Injectable } from '@nestjs/common';
import { AuxService } from '../_aux/_aux.service';
import { PrismaService } from '../prisma/prisma.service';
import { ICreateActivities } from './interfaces/activities.interfaces';
import {
  TActivitesAndCurriculumOutput,
  TActivitiesCreateInput,
  TActivitiesCreateManyInput,
  TActivitiesUpdateInput,
  TActivitiesWhereInput,
} from './types/activities.types';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prismaService: PrismaService, private readonly auxService: AuxService) { }

  async checkActivitiesByIds(ids: Array<string>): Promise<Array<{activityId: string, hoursWorkload: number}>> {
    const activitiesIds = await this.prismaService.activities.findMany({
      where: { activityId: {in: ids} },
      select: {activityId: true, hoursWorkload: true},
    });

    return activitiesIds
  }

  async checkPjActivity(data: TActivitiesWhereInput): Promise<TActivitesAndCurriculumOutput> {
    return await this.prismaService.activities.findFirst({
      where: data,
      include: { curriculum: true },
    });
  }

  async getPjUserActivities(pjId: string): Promise<Array<TActivitesAndCurriculumOutput>> {
    return await this.prismaService.activities.findMany({
      where: { userId: pjId },
      include: { curriculum: true },
    });
  }

  async getActivityById(activityId: string): Promise<TActivitesAndCurriculumOutput> {
    return await this.prismaService.activities.findUnique({
      where: { activityId: activityId },
      include: { curriculum: true },
    });
  }

  async createActivityRecord(data: TActivitiesCreateInput): Promise<TActivitesAndCurriculumOutput> {
    return await this.prismaService.activities.create({
      data: data,
      include: { curriculum: true },
    });
  }

  async editActivity(activityId: string, data: TActivitiesUpdateInput): Promise<TActivitesAndCurriculumOutput> {
    return await this.prismaService.activities.update({
      where: { activityId: activityId },
      data: data,
      include: { curriculum: true },
    });
  }

  async deleteActivity(activityId: string) {
    await this.prismaService.activities.delete({
      where: { activityId: activityId },
    });
  }

  async createActivity(
    idPj: string,
    data: TActivitiesCreateInput,
    studyFieldId?: string,
    curriculums?: Array<string>,
  ): Promise<TActivitesAndCurriculumOutput> {
    const activityData = await this.checkPjActivity({
      name: data.name,
      description: data.description,
      userId: idPj,
      hoursWorkload: data.hoursWorkload,
    });

    if (activityData) {
      return activityData;
    }

    if (studyFieldId) {
      const validStudyField = await this.auxService.getValidStudyFieldsIds([studyFieldId]);
      if (validStudyField.length > 0) {
        data.studyFields = { connect: { studyFieldId: validStudyField[0] } };
      }
    }

    if (curriculums.length > 0) {
      const validCurriculumIds = await this.auxService.getValidCurriculumsIds(curriculums);
      if (validCurriculumIds.length > 0) {
        data.curriculum = {
          create: curriculums.map((c) => {
            return { curriculumId: c };
          }),
        };
      }
    }

    return await this.createActivityRecord(data);
  }

  async getCreateActivityFromArray(activitiesData: Array<ICreateActivities>) {
    const activities: Array<TActivitiesCreateManyInput> = (
      await Promise.all(
        activitiesData.map(async (activityInfo) => {
          const { studyField, idPj, ...rest } = activityInfo;

          const activityData = await this.checkPjActivity({
            name: rest.name,
            description: rest.description,
            userId: idPj,
            hoursWorkload: rest.hoursWorkload,
          });

          if (activityData) {
            return null;
          }
          //TODO: ADD VALIDATION IF ALREADY EXISTS TO RETURN ID

          const data: TActivitiesCreateManyInput = {
            userId: idPj,
            ...rest,
          };
          if (studyField) {
            const validStudyField = await this.auxService.getValidStudyFieldsIds([studyField]);
            if (validStudyField.length > 0) {
              data.studyFieldId = validStudyField[0];
            }
          }

          return data;
        }),
      )
    ).filter((x) => x != null);

    return activities
    // await this.prismaService.activities.createMany({
    //   data: activities,
    // });
  }
}
