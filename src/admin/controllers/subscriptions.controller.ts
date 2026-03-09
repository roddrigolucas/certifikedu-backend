import { Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard';
import { SubscriptionsService } from '../../payments/services/subscriptions.service';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { ListUsersSubscriptionsAdminDto } from '../dtos/subscriptions/subscriptions-input.dto';
import { ResponseUserSubscriptionAdminDto } from '../dtos/subscriptions/subscriptions-response.dto';

@ApiTags('ADMIN -- Pagarme Subscriptions')
@Controller('admin/payments/subscriptions')
@UseGuards(JwtGuard, RolesGuard)
export class PagarmeSubscriptionAdminController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Roles('admin')
  @Get(':userId')
  async getUserSubscription(@Param('userId') userId: string): Promise<ResponseUserSubscriptionAdminDto> {
    return null;
  }

  @Roles('admin')
  @Get()
  async getUsersSubscriptions(
    @Query() params: ListUsersSubscriptionsAdminDto,
  ): Promise<ResponseUserSubscriptionAdminDto> {
    return null;
  }

  @Roles('admin')
  @Delete(':userId')
  async cancelUserSubscription(@Param('userId') userId: string): Promise<ResponseUserSubscriptionAdminDto> {
    return null;
  }

  @Roles('admin')
  @Patch('item/:itemId')
  async editSubscriptionItem(@Param('userId') userId: string): Promise<ResponseUserSubscriptionAdminDto> {
    return null;
  }

  @Roles('admin')
  @Delete('item/:itemId')
  async deleteSubscriptionItem(@Param('userId') userId: string): Promise<ResponseUserSubscriptionAdminDto> {
    return null;
  }
}
