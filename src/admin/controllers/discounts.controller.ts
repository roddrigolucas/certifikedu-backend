import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard';
import { DiscountsService } from '../../payments/services/discounts.service';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { CreateDiscountAdminDto } from '../dtos/discounts/discounts-input.dto';

@ApiTags('ADMIN -- Pagarme Discounts')
@Controller('admin/payments/subscriptions/discounts')
@UseGuards(JwtGuard, RolesGuard)
export class PagarmeDiscountsAdminController {
  constructor(private readonly discountService: DiscountsService) {}

  @Roles('admin')
  @Post('')
  async createDiscountCode(@Body() dto: CreateDiscountAdminDto): Promise<{ success: boolean }> {
    return { success: true };
  }

  @Roles('admin')
  @Patch(':subscriptionId/:code')
  async addDiscountToSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Param('code') discountCode: string,
  ): Promise<{ success: boolean }> {
    return { success: true };
  }

  @Roles('admin')
  @Delete(':subscriptionId/:discountId')
  async deleteDiscountFromSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Param('discountId') discountId: string,
  ): Promise<{ success: boolean }> {
    return { success: true };
  }
}
