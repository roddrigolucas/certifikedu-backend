import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { ResponseListPlansAdminDto, ResponsePagarmePlanAdminDto } from '../dtos/plans/plans-response.dto';
import {
  CreatePagarmePlanAdminDto,
  EditPagarmePlanAdminDto,
  EditPagarmePlanItemAdminDto,
} from '../dtos/plans/plans-input.dto';
import { PlansService } from '../../payments/services/plans.service';
import { TPagarmePlanInfoOutput } from '../../payments/types/plans.types';

@ApiTags('ADMIN -- Pagarme Plans')
@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
export class PagarmePlansAdminController {
  constructor(private readonly plansService: PlansService) {}

  @Roles('admin')
  @Post('/plans')
  async createPlan(@Body() dto: CreatePagarmePlanAdminDto): Promise<ResponsePagarmePlanAdminDto> {
    const plan = await this.plansService.createPlan(dto);

    if (!plan) {
      throw new ServiceUnavailableException('Unable to create plan on Pagarme');
    }

    return {
      message: 'Success',
      response: {
        data: this.getPlanResponse(plan),
      },
    };
  }

  @Roles('admin')
  @Get('/plans/:id')
  async getPlan(@Param('id') planId: string): Promise<ResponsePagarmePlanAdminDto> {
    const plan = await this.plansService.getPlanById(planId);

    if (!plan) {
      throw new NotFoundException('Plan not found.');
    }

    return {
      message: 'Success',
      response: {
        data: this.getPlanResponse(plan),
      },
    };
  }

  @Roles('admin')
  @Get('/plans/')
  async getPlans(): Promise<ResponseListPlansAdminDto> {
    await this.plansService.refreshPlans();

    const plans = await this.plansService.listPlans();

    return {
      plans: plans.map((plan) => {
        return {
          planId: plan.planId,
          createdAt: plan.createdAt,
          isDefault: plan.recommendend,
          planName: plan.planName,
          price: plan.montlhyPrice,
          receivedCertificateQuota: plan.receivedCertificateQuota,
          emittedCertificatesQuota: plan.emittedCertificatesQuota,
        };
      }),
    };
  }

  @Roles('admin')
  @Patch('/plans/:id')
  async editPlan(
    @Param('id') planId: string,
    @Body() dto: EditPagarmePlanAdminDto,
  ): Promise<ResponsePagarmePlanAdminDto> {
    if (!(await this.plansService.checkPlanById(planId))) {
      throw new NotFoundException('Plan not Found');
    }

    const plan = await this.plansService.editPlan(planId, dto);

    if (!plan) {
      throw new ServiceUnavailableException('Unable to edit plan on Pagarme');
    }

    return {
      message: 'Success',
      response: {
        data: this.getPlanResponse(plan),
      },
    };
  }

  @Roles('admin')
  @Delete('/plans/:id')
  async deletePlan(@Param('id') planId: string): Promise<{ success: true }> {
    const plan = await this.plansService.deletePlan(planId);

    if (!plan) {
      throw new ServiceUnavailableException('Unable to delete plan on Pagarme');
    }

    return { success: true };
  }

  @Roles('admin')
  @Patch('/plans/:planId/items/:itemId')
  async editPlanItem(
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
    @Body() dto: EditPagarmePlanItemAdminDto,
  ): Promise<ResponsePagarmePlanAdminDto> {
    const plan = await this.plansService.editPlanItem(planId, itemId, dto);

    if (!plan) {
      throw new ServiceUnavailableException('Unable to edit plan item on Pagarme');
    }

    return {
      message: 'Success',
      response: {
        data: this.getPlanResponse(plan),
      },
    };
  }

  private getPlanResponse(plan: TPagarmePlanInfoOutput) {
    return {
      planId: plan.planId,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      isActive: plan.isActive,
      recommended: plan.recommendend,
      planName: plan.planName,
      description: plan.description,
      descriptionPagarme: plan.descriptionPagarme,
      installments: plan.installments,
      interval: plan.interval,
      billingType: plan.billingType,
      billingDays: plan.billingDays ?? [],
      pdisQty: plan.pdisQty,
      pdiPeriod: plan.pdiPeriod,
      emittedCertificatesQuota: plan.emittedCertificatesQuota,
      emittedCertificatesPeriod: plan.emittedCertificatesPeriod,
      receivedCertificateQuota: plan.receivedCertificateQuota,
      receivedCertificatePeriod: plan.receivedCertificatePeriod,
      singleCertificatePrice: plan.singleCertificatePrice,
      price: plan.montlhyPrice,
      paymentMethod: plan.paymentMethod,
      items: plan.items.map((item) => {
        return {
          id: item.planItemId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          cycles: item.cycles,
          pricing_scheme: {
            price: item.price,
            scheme_type: item.schemeType,
          },
        };
      }),
    };
  }
}
