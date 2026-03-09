import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TBasicPlanCreateInput, TBasicPlanInfoOutput, TBasicPlanUpdateInput } from '../types/plans.types';

@Injectable()
export class InternalPlansService {
  constructor(private readonly prismaService: PrismaService) { }

  async createInternalPlan(data: TBasicPlanCreateInput): Promise<TBasicPlanInfoOutput> {
    return await this.prismaService.basicPlans.create({
      data: data,
    });
  }

  async getInternalPlan(planId: string): Promise<TBasicPlanInfoOutput> {
    return await this.prismaService.basicPlans.findUnique({
      where: { planId: planId },
    });
  }

  async getInternalPlanDefault(): Promise<TBasicPlanInfoOutput> {
    return await this.prismaService.basicPlans.findFirst({
      where: { isDefault: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async editInternalPlan(planId: string, data: TBasicPlanUpdateInput): Promise<TBasicPlanInfoOutput> {
    return await this.prismaService.basicPlans.update({
      where: { planId: planId },
      data: data,
    });
  }

  async setInternalPlanDefault(planId: string): Promise<TBasicPlanInfoOutput> {
    const updatePlans = this.prismaService.basicPlans.updateMany({
      where: { planId: { not: planId } },
      data: { isDefault: false },
    });

    const planInfo = this.prismaService.basicPlans.update({
      where: { planId: planId },
      data: { isDefault: true },
    });

    const updateSubs = this.prismaService.basicPlanSubscriptions.updateMany({
      data: { planId: planId },
    });

    const [_, plan, __] = await this.prismaService.$transaction([updatePlans, planInfo, updateSubs]);

    return plan;
  }

}
