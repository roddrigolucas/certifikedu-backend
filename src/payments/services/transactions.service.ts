import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICardLastTransactionResponsePagarme } from '../pagarme/orders/interfaces/charges/pagarme-last-transactions.interfaces';
import { ICreateOrderCreditCardPagarme } from '../pagarme/orders/interfaces/orders/pagarme-orders-input.interfaces';
import { IOrderResponsePagarme } from '../pagarme/orders/interfaces/orders/pagarme-orders-response.interfaces';
import { PagarmeOrderService } from '../pagarme/orders/services/pagarme-orders.service';
import { TOrderCreateInput } from '../types/orders.types';
import { randomUUID } from 'crypto';
import { ChargesService } from './charges.service';
import { IOrderItemResponsePagarme } from '../pagarme/orders/interfaces/items/pagarme-orders-items-response.interfaces';
// import { PagarmeOrderItemsService } from '../pagarme/orders/services/pagarme-orders-items.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pagarmeOrdersService: PagarmeOrderService,
    // private readonly pagarmeOrdersItemsService: PagarmeOrderItemsService,
    private readonly chargesService: ChargesService,
  ) {}

  async createCertificateCreditRecords(customerId: string, amount: number) {
    await this.prismaService.certificatesCredits.createMany({
      data: Array.from({ length: amount }, () => {
        return { customerId: customerId };
      }),
    });
  }

  async createOrderRecord(data: TOrderCreateInput) {
    return await this.prismaService.pagarmeOrders.create({
      data: data,
    });
  }

  async createCertificateCreditOrder(customerId: string, cardId: string, creditAmount: number, price: number) {
    const certificateCreditId = randomUUID();

    const orderInfo: ICreateOrderCreditCardPagarme = {
      customer_id: customerId,
      closed: true,
      antifraud_enabled: false,
      code: certificateCreditId,
      items: [
        {
          amount: price,
          description: 'certificate credit',
          quantity: creditAmount,
          code: certificateCreditId,
        },
      ],
      payments: [
        {
          payment_method: 'credit_card',
          credit_card: {
            operation_type: 'auth_and_capture',
            statement_descriptor: 'CRTFKEDU CRDT',
            installments: 1,
            card_id: cardId,
            recurrence_model: 'standing_order',
          },
        },
      ],
    };

    const order = await this.pagarmeOrdersService.createCreditCardOrderPagarme(orderInfo);

    if (!order) {
      return null;
    }

    await this.createOrder(order);
    await this.createOrderItems(order.items);
    await this.chargesService.createChargesFromCardOrder(order.charges);

    await this.createCertificateCreditRecords(customerId, creditAmount);

    return true;
  }

  async createOrderItems(items: Array<IOrderItemResponsePagarme>) {
    return items;
  }

  async createOrder(order: IOrderResponsePagarme<ICardLastTransactionResponsePagarme>) {
    const itemsIds: string[] = order.items.map((item: any) => item.id);
    const chargeIds: string[] = order.charges.map((charges: any) => charges.id);

    const orderData: TOrderCreateInput = {
      orderId: order.id,
      orderCreatedAt: order.created_at,
      orderUpdatedAt: order.updated_at,
      orderClosedAt: order.closed_at,
      amount: order.amount,
      currency: order.currency,
      closed: order.closed,
      status: order.status,
      itemsIds: itemsIds,
      chargesIds: chargeIds,
      pagarmeCustomer: { connect: { customerId: order.customer.id } },
      pagarmeCards: { connect: { cardId: order.charges.at(0).last_transaction.card.id } },
    };

    await this.createOrderRecord(orderData);
  }
}
