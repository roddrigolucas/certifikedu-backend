import { Injectable } from '@nestjs/common';
import { PagarmeService } from '../../services/pagarme.service';
import { IListSubscriptionCycleQueryPagarme } from '../interfaces/cycles/pagarme-subscriptions-cycles-input.interfaces';
import { IListSubscriptionCycleResponsePagarme, ISubscriptionCycleResponsePagarme } from '../interfaces/cycles/pagarme-subscriptions-cycles-response.interfaces';

@Injectable()
export class PagarmeSubCyclesService {
  constructor(private readonly pagarmeService: PagarmeService) {}

  async renewSubscriptionCyclePagarme(subscriptionId: string): Promise<ISubscriptionCycleResponsePagarme> {
    const response = await this.pagarmeService.axios.post(`/subscriptions/${subscriptionId}/cycles`);
    return response.data;
  }

  async getSubscriptionCyclePagarme(subscriptionId: string, cycleId: string): Promise<ISubscriptionCycleResponsePagarme> {
    const response = await this.pagarmeService.axios.get(`/subscriptions/${subscriptionId}/cycles/${cycleId}`);
    return response.data;
  }

  async listSubscriptionsCyclePagarme(
    subscriptionId: string,
    queryParam: IListSubscriptionCycleQueryPagarme,
  ): Promise<IListSubscriptionCycleResponsePagarme> {
    if (queryParam.next) {
      const response = await this.pagarmeService.axios.get(`/${queryParam.next.split('/').at(-1)}`);
      return response.data;
    }

    const params = new URLSearchParams();

    if (queryParam.id) params.append('id', queryParam.id);
    if (queryParam.billing_at) params.append('billing_at', queryParam.billing_at.toString());
    if (queryParam.cycle) params.append('cycle', queryParam.cycle.toString());
    if (queryParam.start_at) params.append('start_at', queryParam.start_at.toString());
    if (queryParam.end_at) params.append('end_at', queryParam.end_at.toString());
    if (queryParam.duration) params.append('duration', queryParam.duration);
    if (queryParam.created_at) params.append('created_at', queryParam.created_at.toString());
    if (queryParam.updated_at) params.append('updated_at', queryParam.updated_at.toString());
    if (queryParam.status) params.append('status', queryParam.status);

    const response = await this.pagarmeService.axios.get(`/subscriptions/${subscriptionId}/cycles?${params.toString()}`);
    return response.data;
  }
}
