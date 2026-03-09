import { Injectable } from '@nestjs/common';
import { PagarmeService } from '../../services/pagarme.service';
import {
  IListSubscriptionItemUsagesQueryPagarme,
  IUseSubscriptionItemPagarme,
} from '../interfaces/usage/pagarme-subscriptions-usage-input.interfaces';
import {
  IListSubscriptionItemUsagesResponsePagarme,
  ISubscriptionItemUsageResponsePagarme,
} from '../interfaces/usage/pagarme-subscriptions-usage-response.interfaces';

@Injectable()
export class PagarmeSubUsageService {
  constructor(private readonly pagarmeService: PagarmeService) { }

  async includeSubscriptionUsagePagarme(
    subscriptionId: string,
    itemId: string,
    usageInfo: IUseSubscriptionItemPagarme,
  ): Promise<ISubscriptionItemUsageResponsePagarme> {
    const response = await this.pagarmeService.axios.post(
      `/subscriptions/${subscriptionId}/items/${itemId}/usages`,
      usageInfo,
    );
    return response.data;
  }

  async removeSubscriptionUsagePagarme(
    subscriptionId: string,
    itemId: string,
    usageId: string,
  ): Promise<ISubscriptionItemUsageResponsePagarme> {
    const response = await this.pagarmeService.axios.delete(
      `/subscriptions/${subscriptionId}/items/${itemId}/usages/${usageId}`,
    );
    return response.data;
  }

  async listSubscriptionUsagePagarme(
    subscriptionId: string,
    itemId: string,
    queryParam: IListSubscriptionItemUsagesQueryPagarme,
  ): Promise<IListSubscriptionItemUsagesResponsePagarme> {
    if (queryParam.next) {
      const response = await this.pagarmeService.axios.get(`/${queryParam.next.split('/').at(-1)}`);
      return response.data;
    }

    const params = new URLSearchParams();

    if (queryParam.code) params.append('code', queryParam.code);
    if (queryParam.group) params.append('group', queryParam.group);

    params.append('page', queryParam.page.toString());
    params.append('size', queryParam.size.toString());

    const response = await this.pagarmeService.axios.get(
      `/subscriptions/${subscriptionId}/items/${itemId}/usages?${params.toString()}`,
    );
    return response.data;
  }
}
