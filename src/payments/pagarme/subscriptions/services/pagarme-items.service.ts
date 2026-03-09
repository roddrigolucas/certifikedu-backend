import { Injectable } from '@nestjs/common';
import { PagarmeService } from '../../services/pagarme.service';
import { IEditSubscriptionItemPagarme, IIncludeSubscriptionItemPagarme, IListSubscriptionItemsQueryPagarme } from '../interfaces/items/pagarme-subscription-items-input.interfaces';
import { ISubscriptionItemResponsePagarme } from '../interfaces/items/pagarme-subscriptions-items-response.interfaces';

@Injectable()
export class PagarmeSubItemsService {
  constructor(private readonly pagarmeService: PagarmeService) { }

  async includeSubscriptionItemPagarme(
    subscriptionId: string,
    itemInfo: IIncludeSubscriptionItemPagarme,
  ): Promise<ISubscriptionItemResponsePagarme> {
    const response = await this.pagarmeService.axios.post(`/subscriptions/${subscriptionId}`, itemInfo);
    return response.data;
  }

  async editSubscriptionItemPagarme(
    subscriptionId: string,
    itemId: string,
    itemInfo: IEditSubscriptionItemPagarme,
  ): Promise<ISubscriptionItemResponsePagarme> {
    const response = await this.pagarmeService.axios.put(`/subscriptions/${subscriptionId}/items/${itemId}`, itemInfo);
    return response.data;
  }

  async deleteSubscriptionItemPagarme(
    subscriptionId: string,
    itemId: string,
  ): Promise<ISubscriptionItemResponsePagarme> {
    const response = await this.pagarmeService.axios.delete(`/subscriptions/${subscriptionId}/items/${itemId}`);
    return response.data;
  }

  async listSubscriptionItemsPagarme(
    subscriptionId: string,
    queryParam: IListSubscriptionItemsQueryPagarme,
  ): Promise<ISubscriptionItemResponsePagarme> {
    if (queryParam.next) {
      const response = await this.pagarmeService.axios.get(`/${queryParam.next.split('/').at(-1)}`);
      return response.data;
    }

    const params = new URLSearchParams();

    if (queryParam.status) params.append('status', queryParam.status);
    if (queryParam.name) params.append('name', queryParam.name);
    if (queryParam.description) params.append('description', queryParam.description);
    if (queryParam.cycle) params.append('cycle', queryParam.cycle.toString());
    if (queryParam.created_since) params.append('created_since', queryParam.created_since.toString());
    if (queryParam.created_until) params.append('updated_until', queryParam.created_until.toString());

    params.append('page', queryParam.page.toString());
    params.append('size', queryParam.size.toString());

    const response = await this.pagarmeService.axios.delete(`/subscriptions/${subscriptionId}/`);
    return response.data;
  }

}

