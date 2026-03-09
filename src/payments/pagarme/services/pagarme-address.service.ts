import { Injectable } from '@nestjs/common';
import {
  IAddressQueryPagarme,
  ICreateAddressPagarme,
  IEditAddressPagarme,
} from '../interfaces/address/pagarme-address-input.interfaces';
import {
  IAddressResponsePagarme,
  IListAddressResponsePagarme,
} from '../interfaces/address/pagarme-address-response.interfaces';
import { PagarmeService } from './pagarme.service';

@Injectable()
export class PagarmeAddressService {
  constructor(private readonly pagarmeService: PagarmeService) { }

  async createCustomerAddressPagarme(
    customerId: string,
    addressInfo: ICreateAddressPagarme,
  ): Promise<IAddressResponsePagarme> {
    const response = await this.pagarmeService.axios.post(`/customers/${customerId}/addresses`, addressInfo);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async getCustomerAddressPagarme(customerId: string, addressId: string): Promise<IAddressResponsePagarme> {
    const response = await this.pagarmeService.axios.get(`/customers/${customerId}/addresses/${addressId}`);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async editCustomerAddressPagarme(
    customerId: string,
    addressId: string,
    addressInfo: IEditAddressPagarme,
  ): Promise<IAddressResponsePagarme> {
    const response = await this.pagarmeService.axios.put(
      `/customers/${customerId}/addresses/${addressId}`,
      addressInfo,
    );

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async deleteCustomerAddressPagarme(customerId: string, addressId: string): Promise<IAddressResponsePagarme> {
    const response = await this.pagarmeService.axios.delete(`/customers/${customerId}/addresses/${addressId}`);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async listCustomerAddressPagarme(
    customerId: string,
    queryParams: IAddressQueryPagarme,
  ): Promise<IListAddressResponsePagarme> {
    const params = new URLSearchParams();

    params.append('page', queryParams.page.toString());
    params.append('size', queryParams.size.toString());

    const response = await this.pagarmeService.axios.get(`/customers/${customerId}/addresses?${params.toString()}`);

    if (!response.data) {
      return null;
    }

    return response.data;
  }
}
