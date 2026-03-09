import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../auth/decorators';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { InternalPlansService } from '../services/internal-plans.service';
import { PaymentsService } from '../services/payments.service';
import { PlansService } from '../services/plans.service';
import {
  ResponseInternalPlanDto,
  ResponseInternalPlanInfoInternalDto,
  ResponsePagarmePlansInternalDto,
  ResponseUserCertificatePriceInternalDto,
  ResponseUserCreditsInternalDto,
} from '../dtos/internal/internal-response.dto';

@ApiTags('Payments -- Internal')
@Controller('payments')
@UseGuards(JwtGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly internalPlansService: InternalPlansService,
    private readonly plansService: PlansService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles('review')
  @Get('/certifikedu/plan')
  async getInternalPlanDefault(): Promise<ResponseInternalPlanDto> {
    const planInfo = await this.internalPlansService.getInternalPlanDefault();

    return {
      ...planInfo,
      planName: planInfo.name,
    };
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Get('/user/credits')
  async getUserCredits(@GetUser('id') userId: string): Promise<ResponseUserCreditsInternalDto> {
    return this.paymentsService.getUserCredits(userId);
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Get('certificate/credit/price')
  async getCertificatePrice(@GetUser('id') userId: string): Promise<ResponseUserCertificatePriceInternalDto> {
    return {
      status: 'Success',
      response: {
        message: 'Preco atualizado de cada credito:',
        data: {
          price: (await this.paymentsService.getUserCertificatePrice(userId)).toString(),
        },
      },
    };
  }

  @UseGuards(RolesGuard)
  @Roles('review')
  @Get('/certifikedu/plan/:id')
  async getInternalPlan(@Param('id') planId: string): Promise<ResponseInternalPlanInfoInternalDto> {
    const planInfo = await this.internalPlansService.getInternalPlan(planId);

    return {
      ...planInfo,
      planName: planInfo.name,
    };
  }

  @UseGuards(RolesGuard)
  @Roles('review')
  //TODO: CHANGE THIS ROUTE TO ACCEPT A QUERY INSTEAD OF A PARAM
  @Get('/plans/:status')
  async listPlans(
    @Param('status') status: 'active' | 'inactive' | 'deleted',
  ): Promise<ResponsePagarmePlansInternalDto> {
    const plans = await this.plansService.getPlansInfo({ status: status, page: 1, size: 100 });

    return {
      message: 'Success',
      response: {
        data: plans.map((plan) => {
          return {
            planId: plan.planId,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
            isActive: plan.isActive,
            recommended: plan.recommendend,
            planName: plan.planName,
            description: plan.description,
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
        }),
      },
    };
  }

}
