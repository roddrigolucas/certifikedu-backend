import { Injectable } from '@nestjs/common';
import { PagarmeService } from '../../services/pagarme.service';
import {
  ICreateSubscriptionInvoicePagarme,
  IEditSubscriptionInvoiceMetadataPagarme,
  IListSubscriptionInvoiceQueryPagarme,
} from '../interfaces/invoices/pagarme-subscriptions-invoices-input.interfaces';
import {
  IListSubscriptionInvoiceResponsePagarme,
  ISubscriptionInvoiceResponsePagarme,
} from '../interfaces/invoices/pagarme-subscriptions-invoices-response.interfaces';

@Injectable()
export class PagarmeSubInvoicesService {
  constructor(private readonly pagarmeService: PagarmeService) { }

  async createInvoicePagarme(
    subscriptionId: string,
    cycleId: string,
    invoiceInfo?: ICreateSubscriptionInvoicePagarme,
  ): Promise<ISubscriptionInvoiceResponsePagarme> {
    const response = await this.pagarmeService.axios.post(
      `/subscriptions/${subscriptionId}/cycles/${cycleId}/pay`,
      invoiceInfo,
    );
    if (!response.data) {
      const invoices = await this.listInvoicesPagarme({ subscription_id: subscriptionId, page: 1, size: 20 });

      if (!invoices) {
        return null;
      }

      const invoice = invoices.data.filter((invoice) => invoice.cycle.id === cycleId)?.at(0);

      if (!invoice) {
        return null;
      }

      return invoice;
    }

    return response.data;
  }

  async getInvoicePagarme(invoiceId: string): Promise<ISubscriptionInvoiceResponsePagarme> {
    const response = await this.pagarmeService.axios.get(`/invoices/${invoiceId}`);
    return response.data;
  }

  async editInvoiceMetadataPagarme(
    invoiceId: string,
    invoiceInfo: IEditSubscriptionInvoiceMetadataPagarme,
  ): Promise<ISubscriptionInvoiceResponsePagarme> {
    const response = await this.pagarmeService.axios.patch(`/invoices/${invoiceId}/metadata`, invoiceInfo);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async cancelSubscriptionInvoiceMetadataPagarme(invoiceId: string): Promise<ISubscriptionInvoiceResponsePagarme> {
    const response = await this.pagarmeService.axios.delete(`/invoices/${invoiceId}`);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async listInvoicesPagarme(
    queryParam: IListSubscriptionInvoiceQueryPagarme,
  ): Promise<IListSubscriptionInvoiceResponsePagarme> {
    if (queryParam.next) {
      const response = await this.pagarmeService.axios.get(`/${queryParam.next.split('/').at(-1)}`);
      return response.data;
    }

    const params = new URLSearchParams();

    if (queryParam.status) params.append('status', queryParam.status);
    if (queryParam.customer_id) params.append('customer_id', queryParam.customer_id);
    if (queryParam.subscription_id) params.append('subscription_id', queryParam.subscription_id.toString());
    if (queryParam.due_since) params.append('due_since', queryParam.due_since.toString());
    if (queryParam.due_until) params.append('due_until', queryParam.due_until.toString());
    if (queryParam.created_since) params.append('created_since', queryParam.created_since.toString());
    if (queryParam.created_until) params.append('created_until', queryParam.created_until.toString());

    params.append('page', queryParam.page.toString());
    params.append('size', queryParam.size.toString());

    const response = await this.pagarmeService.axios.get(`/invoices?${params.toString()}`);

    if (!response.data) {
      return null;
    }

    return response.data;
  }
}
