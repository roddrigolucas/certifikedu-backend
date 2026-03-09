import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { TransactionsService } from '../../payments/services/transactions.service';
import { ResponseListUsersOrdersAdminDto, ResponseUserOrdersAdminDto } from '../dtos/orders/orders-response.dto';
import { ListUsersOrdersAdminDto } from '../dtos/orders/orders-input.dto';

@ApiTags('ADMIN -- Pagarme Transactions')
@Controller('admin/payments/transactions')
@UseGuards(JwtGuard, RolesGuard)
export class PagarmeOrdersAdminController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Roles('admin')
  @Get(':userId')
  async getUserOrders(@Param('userId') userId: string): Promise<ResponseUserOrdersAdminDto> {
    return null;
  }

  @Roles('admin')
  @Get()
  async getOrders(@Query() params: ListUsersOrdersAdminDto): Promise<ResponseListUsersOrdersAdminDto> {
    return null;
  }
}
