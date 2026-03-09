import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard';
import { IncrementsService } from '../../payments/services/increments.service';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { CreateIncrementAdminDto } from '../dtos/increments/increments-inputs.dto';

@ApiTags('ADMIN -- Pagarme Increments')
@Controller('admin/payments/subscriptions/increments')
@UseGuards(JwtGuard, RolesGuard)
export class PagarmeIncrementsAdminController {
  constructor(private readonly incrementService: IncrementsService) {}

  @Roles('admin')
  @Post('')
  async createIncrementCode(@Body() dto: CreateIncrementAdminDto): Promise<{ success: boolean }> {
    return { success: true };
  }

  @Roles('admin')
  @Patch(':code')
  async addIncrementToSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Param('code') incrementCode: string,
  ): Promise<{ success: boolean }> {
    return { success: true };
  }

  @Roles('admin')
  @Delete(':incrementId')
  async deleteIncrementFromSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Param('incrementId') incrementId: string,
  ): Promise<{ success: boolean }> {
    return { success: true };
  }
}
