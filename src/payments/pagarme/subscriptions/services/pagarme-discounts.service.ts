import { Injectable } from '@nestjs/common';
import { PagarmeService } from '../../services/pagarme.service';
import { IIncludeSubscriptionDiscountPagarme } from '../interfaces/discounts/pagarme-subscriptions-discounts-input.interfaces';
import { IListSubscriptionsDiscountResponsePagarme, ISubscriptionDiscountResponsePagarme } from '../interfaces/discounts/pagarme-subscriptions-discounts-response.interfaces';

@Injectable()
export class PagarmeSubDiscoutsService {
  constructor(private readonly pagarmeService: PagarmeService) { }

  async createSubscriptionDiscountPagarme(
    subscriptionId: string,
    discountInfo: IIncludeSubscriptionDiscountPagarme,
  ): Promise<ISubscriptionDiscountResponsePagarme> {
    const response = await this.pagarmeService.axios.post(`/subscriptions/${subscriptionId}/discounts`, discountInfo);
    return response.data;
  }

  async getSubscriptionDiscountPagarme(
    subscriptionId: string,
    discountId: string,
  ): Promise<ISubscriptionDiscountResponsePagarme> {
    const response = await this.pagarmeService.axios.get(`/subscriptions/${subscriptionId}/discounts/${discountId}`);
    return response.data;
  }

  async removeSubscriptionDiscountPagarme(
    subscriptionId: string,
    discountId: string,
  ): Promise<ISubscriptionDiscountResponsePagarme> {
    const response = await this.pagarmeService.axios.delete(`/subscriptions/${subscriptionId}/discounts/${discountId}`);
    return response.data;
  }

  async listSubscriptionDiscountPagarme(
    subscriptionId: string,
  ): Promise<IListSubscriptionsDiscountResponsePagarme> {
    const response = await this.pagarmeService.axios.get(`/subscriptions/${subscriptionId}/discounts`);
    return response.data;
  }
}
