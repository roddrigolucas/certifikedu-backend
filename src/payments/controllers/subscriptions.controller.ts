import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../auth/decorators';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { CreatePlanSubscriptionDto } from '../dtos/subscription/subscriptions-input.dto';
import { ICreatePlannedSubscriptionPagarme } from '../pagarme/subscriptions/interfaces/subscriptions/pagarme-subscriptions-input.interfaces';
import { CardsService } from '../services/cards.service';
import { CustomerService } from '../services/customer.service';
import { DiscountsService } from '../services/discounts.service';
import { PlansService } from '../services/plans.service';
import { SubscriptionsService } from '../services/subscriptions.service';

@ApiTags('Payments -- Subscriptions')
@Controller('payments/subscriptions')
@UseGuards(JwtGuard, RolesGuard)
@Roles('enabled')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly customersService: CustomerService,
    private readonly cardsService: CardsService,
    private readonly discountsService: DiscountsService,
    private readonly plansService: PlansService,
  ) { }

  @Get()

  @Post()
  async createPlannedSubscription(
    @GetUser('id') userId: string,
    @Body() dto: CreatePlanSubscriptionDto,
  ): Promise<{ success: boolean }> {
    const customerId = await this.customersService.getCustomerIdByUserId(userId);

    if (!customerId) {
      throw new NotFoundException('Customer Not Found');
    }

    if (!(await this.cardsService.checkCardById(dto.creditCardId, customerId))) {
      throw new NotFoundException('Card not Found');
    }

    if (!(await this.plansService.checkPlanById(dto.planId, dto.installments))) {
      throw new NotFoundException('Plan not found.');
    }

    const planInfo = await this.subscriptionsService.getUserSubscriptionInfo(userId);

    if (planInfo.subType === 'pagarme') {
      throw new BadRequestException('This user is already subscribed');
    }

    const subInfo: ICreatePlannedSubscriptionPagarme = {
      code: userId,
      plan_id: dto.planId,
      payment_method: 'credit_card',
      customer_id: customerId,
      card_id: dto.creditCardId,
      installments: dto.installments,
      metadata: {
        userId: userId,
      },
    };

    if (dto.discountCode) {
      const discount = await this.discountsService.getDiscountByCode(dto.discountCode);

      if (!discount) {
        throw new BadRequestException('Invalid Discount Code');
      }

      subInfo.discounts = {
        value: discount.value,
        cycles: discount.cycles,
        discount_type: discount.isFlat ? 'flat' : 'percentage',
      };
    }

    const subscription = await this.subscriptionsService.createPlannedSubscription(subInfo, dto.discountCode);

    if (!subscription) {
      throw new ServiceUnavailableException('Unable to create subscription');
    }

    return { success: true };
  }

  @Delete()
  async cancelPlannedSubscription(@GetUser('id') userId: string): Promise<{ success: true }> {
    const planInfo = await this.subscriptionsService.getUserSubscriptionInfo(userId);

    if (planInfo.subType !== 'pagarme') {
      throw new BadRequestException('This user is not subscribed');
    }

    const subscription = await this.subscriptionsService.cancelPlannedSubscription(planInfo.subscriptionId);

    if (!subscription) {
      throw new ServiceUnavailableException('Unable to create subscription');
    }

    return { success: true };
  }
}
