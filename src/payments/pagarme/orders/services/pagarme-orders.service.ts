import { Injectable } from '@nestjs/common';
import { PagarmeService } from '../../services/pagarme.service';
import { IChargeResponsePagarme } from '../interfaces/charges/pagarme-charges-response.interfaces';
import {
  ICardLastTransactionResponsePagarme,
  IPixLastTransactionResponsePagarme,
  IPixOpenLastTransactionPagarme,
} from '../interfaces/charges/pagarme-last-transactions.interfaces';
import {
  ICloseOrderPagarme,
  ICreateOrderCreditCardPagarme,
  ICreateOrderPixPagarme,
  IIncludeOrderChargeCreditCardPagarme,
  IIncludeOrderChargePixPagarme,
  IListOrdersQueryPagarme,
} from '../interfaces/orders/pagarme-orders-input.interfaces';
import {
  IListOrdersResponsePagarme,
  IOrderResponsePagarme,
  ITreatedOrdersResponsePagarme,
} from '../interfaces/orders/pagarme-orders-response.interfaces';

@Injectable()
export class PagarmeOrderService {
  constructor(private readonly pagarmeService: PagarmeService) { }

  async getCreditCardOrderPagarme(
    orderId: string,
  ): Promise<IOrderResponsePagarme<ICardLastTransactionResponsePagarme>> {
    const response = await this.pagarmeService.axios.get(`/orders/${orderId}`);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async getPixOrderPagarme(orderId: string): Promise<IOrderResponsePagarme<IPixLastTransactionResponsePagarme>> {
    const response = await this.pagarmeService.axios.get(`/orders/${orderId}`);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async createCreditCardOrderPagarme(
    orderInfo: ICreateOrderCreditCardPagarme,
  ): Promise<IOrderResponsePagarme<ICardLastTransactionResponsePagarme>> {
    const response = await this.pagarmeService.axios.post<IOrderResponsePagarme<ICardLastTransactionResponsePagarme>>(`/orders`, orderInfo);

    if (!response.data) {
      return null;
    }

    if (!response.data.charges.at(0).last_transaction.success) {
      return null
    }

      return response.data;
  }

  async createPixOrderPagarme(
    orderInfo: ICreateOrderPixPagarme,
  ): Promise<IOrderResponsePagarme<IPixOpenLastTransactionPagarme>> {
    const response = await this.pagarmeService.axios.post(`/orders`, orderInfo);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async includeCreditCardChargeOnOrderPagarme(
    chargeInfo: IIncludeOrderChargeCreditCardPagarme,
  ): Promise<IOrderResponsePagarme<ICardLastTransactionResponsePagarme>> {
    const response = await this.pagarmeService.axios.post(`/charges`, chargeInfo);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async includePixChargeOnOrderPagarme(
    chargeInfo: IIncludeOrderChargePixPagarme,
  ): Promise<IOrderResponsePagarme<IPixOpenLastTransactionPagarme>> {
    const response = await this.pagarmeService.axios.post(`/charges`, chargeInfo);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async closeCreditCardOrderPagarme(
    orderId: string,
    orderInfo: ICloseOrderPagarme,
  ): Promise<IOrderResponsePagarme<ICardLastTransactionResponsePagarme>> {
    const response = await this.pagarmeService.axios.patch(`/orders/${orderId}/closed`, orderInfo);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async closePixOrderPagarme(
    orderId: string,
    orderInfo: ICloseOrderPagarme,
  ): Promise<IOrderResponsePagarme<IPixLastTransactionResponsePagarme>> {
    const response = await this.pagarmeService.axios.patch(`/orders/${orderId}/closed`, orderInfo);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async listPagarmeOrders(queryParam: IListOrdersQueryPagarme): Promise<ITreatedOrdersResponsePagarme> {
    if (queryParam.next) {
      const response = await this.pagarmeService.axios.get(`/${queryParam.next.split('/').at(-1)}`);

      if (!response.data) {
        return null;
      }

      return response.data;
    }

    const params = new URLSearchParams();

    if (queryParam.code) params.append('code', queryParam.code);
    if (queryParam.status) params.append('status', queryParam.status);
    if (queryParam.customer_id) params.append('customer_id', queryParam.customer_id.toString());
    if (queryParam.created_since) params.append('created_since', queryParam.created_since.toString());
    if (queryParam.created_until) params.append('created_until', queryParam.created_since.toString());
    params.append('page', queryParam.page.toString());
    params.append('size', queryParam.size.toString());

    const response = await this.pagarmeService.axios.get<IListOrdersResponsePagarme>(`/orders?${params.toString()}`);

    if (!response.data) {
      return null;
    }

    return {
      orders: response.data.data.map((order) => {
        const { charges, ...orderData } = order;
        return {
          order: orderData,
          charges: {
            credit_card: charges.filter(
              (charge) => charge.payment_method === 'credit_card' || charge.payment_method === 'debit_card',
            ) as Array<IChargeResponsePagarme<ICardLastTransactionResponsePagarme>>,
            pix_closed: charges.filter(
              (charge) => charge.payment_method === 'pix' && charge.last_transaction.status === 'waiting_payment',
            ) as Array<IChargeResponsePagarme<IPixLastTransactionResponsePagarme>>,
            pix_open: charges.filter(
              (charge) => charge.payment_method === 'pix' && charge.last_transaction.status !== 'waiting_payment',
            ) as Array<IChargeResponsePagarme<IPixOpenLastTransactionPagarme>>,
          },
        };
      }),

      paging: response.data.paging,
    };
  }
}
