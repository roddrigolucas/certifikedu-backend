import { Injectable } from '@nestjs/common';
import {
  ICreateCustomerPagarme,
  IEditCustomerPagarme,
  IQueryCustomerPagarme,
} from '../interfaces/customers/pagarme-customers-input.interfaces';
import {
  ICustomerResponsePagarme,
  IListCustomerResponsePagarme,
} from '../interfaces/customers/pagarme-customers-response.interfaces';
import { PagarmeService } from './pagarme.service';

@Injectable()
export class PagarmeCustomerService {
  constructor(private readonly pagarmeService: PagarmeService) {}

  async getCustomerPagarme(customerId: string): Promise<ICustomerResponsePagarme> {
    const response = await this.pagarmeService.axios.get(`/customers/${customerId}`);

    if (response.status !== 200) {
      return null;
    }

    return response.data;
  }

  async createCustomerPagarme(customerInfo: ICreateCustomerPagarme): Promise<ICustomerResponsePagarme> {
    const response = await this.pagarmeService.axios.post(`/customers`, customerInfo);

    if (response.status !== 200) {
      return null;
    }

    return response.data;
  }

  async editCustomerPagarme(customerId: string, customerInfo: IEditCustomerPagarme): Promise<ICustomerResponsePagarme> {
    const response = await this.pagarmeService.axios.put(`/customers/${customerId}`, customerInfo);

    if (response.status !== 200) {
      return null;
    }

    return response.data;
  }

  async listCustomersPagarme(queryParam: IQueryCustomerPagarme): Promise<IListCustomerResponsePagarme> {
    if (queryParam.next) {
      const response = await this.pagarmeService.axios.get(`/${queryParam.next.split('/').at(-1)}`);
      if (!response.data) {
        return null;
      }
      return response.data;
    }

    const params = new URLSearchParams();

    if (queryParam.name) params.append('name', queryParam.name);
    if (queryParam.document) params.append('document', queryParam.document);
    if (queryParam.email) params.append('email', queryParam.email);
    if (queryParam.code) params.append('code', queryParam.code);
    if (queryParam.gender) params.append('gender', queryParam.gender);
    params.append('page', queryParam.page.toString());
    params.append('size', queryParam.size.toString());

    const response = await this.pagarmeService.axios.get(`/customers/?${params.toString()}`);

    if (!response.data) {
      return null;
    }

    return response.data;
  }
}
