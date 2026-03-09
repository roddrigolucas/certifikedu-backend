import { Injectable } from '@nestjs/common';
import { PagarmeService } from '../../services/pagarme.service';
import {
  ICancelChargePagarme,
  ICaptureChargePagarme,
  IEditChargeCreditCardPagarme,
  IEditChargeDueDatePagarme,
  IListChargesQueryPagarme,
} from '../interfaces/charges/pagarme-charges-input.interfaces';
import {
  IChargeResponsePagarme,
  IListChargesResponsePagarme,
  ITreatedChargesResponsePagarme,
} from '../interfaces/charges/pagarme-charges-response.interfaces';
import {
  ICardLastTransactionResponsePagarme,
  IPixLastTransactionResponsePagarme,
  IPixOpenLastTransactionPagarme,
} from '../interfaces/charges/pagarme-last-transactions.interfaces';
@Injectable()
export class PagarmeChargesService {
  constructor(private readonly pagarmeService: PagarmeService) { }

  async captureChargePagarme<T = ICardLastTransactionResponsePagarme>(
    chargeId: string,
    chargeInfo: ICaptureChargePagarme,
  ): Promise<IChargeResponsePagarme<T>> {
    const response = await this.pagarmeService.axios.post(`/charges/${chargeId}/capture`, chargeInfo);
    return response.data;
  }

  async getChargePagarme<T = ICardLastTransactionResponsePagarme>(
    chargeId: string,
  ): Promise<IChargeResponsePagarme<T>> {
    const response = await this.pagarmeService.axios.get(`/charges/${chargeId}`);
    return response.data;
  }

  //Only to be used when charge fails;
  async changeChargeCreditCardPagarme<T = ICardLastTransactionResponsePagarme>(
    chargeId: string,
    cardInfo: IEditChargeCreditCardPagarme,
  ): Promise<IChargeResponsePagarme<T>> {
    if (!cardInfo.card_id && !cardInfo.card) {
      return null;
    }

    const response = await this.pagarmeService.axios.patch(`/charges/${chargeId}/card`, cardInfo);
    return response.data;
  }

  async editChargeDueDatePagarme<T = ICardLastTransactionResponsePagarme>(
    chargeId: string,
    chargeInfo: IEditChargeDueDatePagarme,
  ): Promise<IChargeResponsePagarme<T>> {
    const response = await this.pagarmeService.axios.patch(`/charges/${chargeId}/due-date`, chargeInfo);
    return response.data;
  }

  async cancelChargePagarme<T = ICardLastTransactionResponsePagarme>(
    chargeId: string,
    chargeInfo: ICancelChargePagarme,
  ): Promise<IChargeResponsePagarme<T>> {
    const response = await this.pagarmeService.axios.delete(`/charges/${chargeId}`, { data: chargeInfo });
    return response.data;
  }

  async retryChargePagarme<T = ICardLastTransactionResponsePagarme>(
    chargeId: string,
  ): Promise<IChargeResponsePagarme<T>> {
    const response = await this.pagarmeService.axios.post(`/charges/${chargeId}`);
    return response.data;
  }

  async listChargesPagarme(queryParam: IListChargesQueryPagarme): Promise<ITreatedChargesResponsePagarme> {
    if (queryParam.next) {
      const response = await this.pagarmeService.axios.get(`/${queryParam.next.split('/').at(-1)}`);
      return response.data;
    }

    const params = new URLSearchParams();

    if (queryParam.code) params.append('code', queryParam.code);
    if (queryParam.status) params.append('status', queryParam.status);
    if (queryParam.customer_id) params.append('customer_id', queryParam.customer_id);
    if (queryParam.order_id) params.append('order_id', queryParam.customer_id);
    if (queryParam.payment_method) params.append('payment_method', queryParam.payment_method);
    if (queryParam.created_since) params.append('created_since', queryParam.created_since.toString());
    if (queryParam.created_until) params.append('created_until', queryParam.created_since.toString());

    params.append('page', queryParam.page.toString());
    params.append('size', queryParam.size.toString());

    const response = await this.pagarmeService.axios.get<IListChargesResponsePagarme>(`/orders?${params.toString()}`);

    return {
      credit_cards: response.data.data.filter((charge) => charge.payment_method === 'credit_card') as Array<
        IChargeResponsePagarme<ICardLastTransactionResponsePagarme>
      >,
      pix_open: response.data.data.filter(
        (charge) => charge.payment_method === 'pix' && charge.last_transaction.status === 'waiting_payment',
      ) as Array<IChargeResponsePagarme<IPixOpenLastTransactionPagarme>>,
      pix_closed: response.data.data.filter(
        (charge) => charge.payment_method === 'pix' && charge.last_transaction.status !== 'waiting_payment',
      ) as Array<IChargeResponsePagarme<IPixLastTransactionResponsePagarme>>,
      paging: response.data.paging,
    };
  }
}
