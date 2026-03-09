import { Injectable } from '@nestjs/common';
import { PagarmeService } from '../../services/pagarme.service';
import { IIncludeSubscriptionIncrementPagarme } from '../interfaces/increments/pagarme-subscriptions-increments-input.interfaces';
import {
  IListSubscriptionsIncrementResponsePagarme,
  ISubscriptionIncrementResponsePagarme,
} from '../interfaces/increments/pagarme-subscriptions-increments-response.interfaces';

@Injectable()
export class PagarmeSubIncrementsService {
  constructor(private readonly pagarmeService: PagarmeService) {}

  async createSubscriptionIncrementPagarme(
    subscriptionId: string,
    incrementInfo: IIncludeSubscriptionIncrementPagarme,
  ): Promise<ISubscriptionIncrementResponsePagarme> {
    const response = await this.pagarmeService.axios.post(`/subscriptions/${subscriptionId}/increments`, incrementInfo);
    return response.data;
  }

  async getSubscriptionIncrementPagarme(
    subscriptionId: string,
    incrementId: string,
  ): Promise<ISubscriptionIncrementResponsePagarme> {
    const response = await this.pagarmeService.axios.get(`/subscriptions/${subscriptionId}/increments/${incrementId}`);
    return response.data;
  }

  async removeSubscriptionIncrementPagarme(
    subscriptionId: string,
    incrementId: string,
  ): Promise<ISubscriptionIncrementResponsePagarme> {
    const response = await this.pagarmeService.axios.delete(`/subscriptions/${subscriptionId}/increments/${incrementId}`);
    return response.data;
  }

  async listSubscriptionIncrementsPagarme(subscriptionId: string): Promise<IListSubscriptionsIncrementResponsePagarme> {
    const response = await this.pagarmeService.axios.get(`/subscriptions/${subscriptionId}/increments`);
    return response.data;
  }
}
