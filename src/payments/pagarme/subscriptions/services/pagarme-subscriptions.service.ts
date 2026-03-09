import { Injectable } from '@nestjs/common';
import { PagarmeService } from '../../services/pagarme.service';
import {
  ICancelSubscriptionPagarme,
  ICreatePlannedSubscriptionPagarme,
  ICreateSubscriptionPagarme,
  IEditSubscriptionCardPagarme,
  IEditSubscriptionMinimumPricePagarme,
  IEditSubscriptionStartDatePagarme,
  IListSubscriptionsQueryPagarme,
} from '../interfaces/subscriptions/pagarme-subscriptions-input.interfaces';
import { ISubscriptionResponsePagarme } from '../interfaces/subscriptions/pagarme-subscriptions-response.interfaces';

@Injectable()
export class PagarmeSubscriptionsService {
  constructor(private readonly pagarmeService: PagarmeService) { }

  async createSubscriptionPagarme(subscriptionInfo: ICreateSubscriptionPagarme): Promise<ISubscriptionResponsePagarme> {
    const response = await this.pagarmeService.axios.post(`/subscriptions/`, subscriptionInfo);
    return response.data;
  }

  async createPlannedSubscriptionPagarme(
    subscriptionInfo: ICreatePlannedSubscriptionPagarme,
  ): Promise<ISubscriptionResponsePagarme> {
    const response = await this.pagarmeService.axios.post(`/subscriptions/`, subscriptionInfo);
    return response.data;
  }

  async getSubscriptionPagarme(subscriptionId: string): Promise<ISubscriptionResponsePagarme> {
    const response = await this.pagarmeService.axios.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  }

  async cancelSubscriptionPagarme(
    subscriptionId: string,
    subscriptionInfo: ICancelSubscriptionPagarme,
  ): Promise<ISubscriptionResponsePagarme> {
    const response = await this.pagarmeService.axios.delete(`/subscriptions/${subscriptionId}`, {
      data: subscriptionInfo,
    });
    return response.data;
  }

  async editSubscriptionCardPagarme(
    subscriptionId: string,
    subscriptionInfo: IEditSubscriptionCardPagarme,
  ): Promise<ISubscriptionResponsePagarme> {
    const response = await this.pagarmeService.axios.patch(`/subscriptions/${subscriptionId}/card`, {
      data: subscriptionInfo,
    });
    return response.data;
  }

  async editSubscriptionStartDatePagarme(
    subscriptionId: string,
    subscriptionInfo: IEditSubscriptionStartDatePagarme,
  ): Promise<ISubscriptionResponsePagarme> {
    const response = await this.pagarmeService.axios.patch(
      `/subscriptions/${subscriptionId}/start-at`,
      subscriptionInfo,
    );
    return response.data;
  }

  async editSubscriptionMinimumPricePagarme(
    subscriptionId: string,
    subscriptionInfo: IEditSubscriptionMinimumPricePagarme,
  ): Promise<ISubscriptionResponsePagarme> {
    const response = await this.pagarmeService.axios.patch(
      `/subscriptions/${subscriptionId}/minimum_price`,
      subscriptionInfo,
    );
    return response.data;
  }

  async listSubscriptionPagarme(queryParam: IListSubscriptionsQueryPagarme): Promise<ISubscriptionResponsePagarme> {
    if (queryParam.next) {
      const response = await this.pagarmeService.axios.get(`/${queryParam.next.split('/').at(-1)}`);
      return response.data;
    }

    const params = new URLSearchParams();

    if (queryParam.status) params.append('status', queryParam.status);
    if (queryParam.code) params.append('code', queryParam.code);
    if (queryParam.billing_type) params.append('billing_type', queryParam.billing_type);
    if (queryParam.customer_id) params.append('customer_id', queryParam.customer_id);
    if (queryParam.plan_id) params.append('plan_id', queryParam.plan_id);
    if (queryParam.card_id) params.append('card_id', queryParam.card_id);
    if (queryParam.next_billing_since) params.append('next_billing_since', queryParam.next_billing_since.toString());
    if (queryParam.next_billing_until) params.append('next_billing_until', queryParam.next_billing_until.toString());
    if (queryParam.created_since) params.append('created_since', queryParam.created_since.toString());
    if (queryParam.created_until) params.append('created_until', queryParam.created_until.toString());

    params.append('page', queryParam.page.toString());
    params.append('size', queryParam.size.toString());
    const response = await this.pagarmeService.axios.get(`/subscriptions?${params.toString()}`);
    return response.data;
  }
}
