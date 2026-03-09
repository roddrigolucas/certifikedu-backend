import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IChargeResponsePagarme } from '../pagarme/orders/interfaces/charges/pagarme-charges-response.interfaces';
import { ICardLastTransactionResponsePagarme } from '../pagarme/orders/interfaces/charges/pagarme-last-transactions.interfaces';
import { PagarmeChargesService } from '../pagarme/orders/services/pagarme-charges.service';
import { ISubscriptionInvoiceResponsePagarme } from '../pagarme/subscriptions/interfaces/invoices/pagarme-subscriptions-invoices-response.interfaces';

@Injectable()
export class ChargesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pagarmeChargesService: PagarmeChargesService,
  ) { }

  async createChargesFromCardOrder(charges: Array<IChargeResponsePagarme<ICardLastTransactionResponsePagarme>>) {
    return null;
  }

  async createChargesFromInvoice(charges: ISubscriptionInvoiceResponsePagarme['charge']) {
    return null;
  }
}
