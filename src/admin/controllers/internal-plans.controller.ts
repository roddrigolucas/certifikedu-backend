import { Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { CreateOrEditInternalPlanAdminDto } from '../dtos/internal-plans/internal-plans-input.dto';
import { ResponseInternalPlanAdminDto } from '../dtos/internal-plans/internal-plans-response.dto';
import { InternalPlansService } from '../../payments/services/internal-plans.service';
import { TBasicPlanCreateInput, TBasicPlanUpdateInput } from '../../payments/types/plans.types';

@ApiTags('ADMIN -- Internal Plans')
@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
export class InternalPlansAdminController {
  constructor(private readonly internalPlansService: InternalPlansService) {}

  @Roles('admin')
  @Post('/certifikedu/plan')
  async createInternalPlan(@Body() dto: CreateOrEditInternalPlanAdminDto): Promise<ResponseInternalPlanAdminDto> {
    const data: TBasicPlanCreateInput = {
      name: dto.planName,
      ...dto,
    };
    const planInfo = await this.internalPlansService.createInternalPlan(data);

    return {
      ...planInfo,
      planName: planInfo.name,
    };
  }

  @Roles('admin')
  @Patch('/certifikedu/plan/:id')
  async editInternalPlan(
    @Param('id') planId: string,
    @Body() dto: CreateOrEditInternalPlanAdminDto,
  ): Promise<ResponseInternalPlanAdminDto> {
    const data: TBasicPlanUpdateInput = {
      name: dto.planName,
      ...dto,
    };

    const planInfo = await this.internalPlansService.editInternalPlan(planId, data);

    return {
      ...planInfo,
      planName: planInfo.name,
    };
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch('/certifikedu/plan/default/:id')
  async setInternalPlanDefault(@Param('id') planId: string): Promise<ResponseInternalPlanAdminDto> {
    const plan = await this.internalPlansService.getInternalPlan(planId);

    if (!plan) {
      throw new NotFoundException('Plan not Found');
    }

    const planInfo = await this.internalPlansService.setInternalPlanDefault(planId);

    return {
      ...planInfo,
      planName: planInfo.name,
    };
  }
}
