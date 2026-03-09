import { Body, Controller, NotFoundException, Post, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../auth/decorators';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { CreateCertificateCreditTransactionsDto } from '../dtos/transactions/transactions-input.dto';
import { ResponseCertificateCreditTransactionsDto } from '../dtos/transactions/transactions-response.dto';
import { CardsService } from '../services/cards.service';
import { CustomerService } from '../services/customer.service';
import { PaymentsService } from '../services/payments.service';
import { TransactionsService } from '../services/transactions.service';

@ApiTags('Payments -- Transactions')
@Controller('payments/order')
@UseGuards(JwtGuard)
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly cardsService: CardsService,
    private readonly customerService: CustomerService,
    private readonly paymentsService: PaymentsService,
  ) { }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Post()
  async createCertificateCredit(
    @GetUser('id') userId: string,
    @Body() dto: CreateCertificateCreditTransactionsDto,
  ): Promise<ResponseCertificateCreditTransactionsDto> {
    const customerId = await this.customerService.getCustomerIdByUserId(userId);

    if (!customerId) {
      throw new ServiceUnavailableException('Unable to create customer');
    }

    const cardId = await this.cardsService.checkCardById(dto.creditCardId, customerId);

    if (!cardId) {
      throw new NotFoundException('Card not found');
    }

    const price = await this.paymentsService.getUserCertificatePrice(userId);

    if (!price) {
      throw new ServiceUnavailableException('Unable to retrieve price for customer');
    }

    const order = await this.transactionsService.createCertificateCreditOrder(customerId, cardId, dto.purchasedAmount, price);

    if (!order) {
      throw new ServiceUnavailableException('Unable to process payment')
    }

    const userCredits = await this.paymentsService.getUserCredits(userId);

    return {
      status: 'Success',
      response: {
        message: 'Créditos comprados com sucesso',
        data: {
          totalBalance: userCredits.certificateCredits.toString(),
          additionalCredits: userCredits.additionalCertificatesCredits.toString(),
        },
      },
    };
  }
}
