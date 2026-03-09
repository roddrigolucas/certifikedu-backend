import { Injectable } from '@nestjs/common';
import { PagarmeService } from '../../services/pagarme.service';
import { IEditOrderItemPagarme, IIncludeOrderItemPagarme } from '../interfaces/items/pagarme-orders-items-input.interfaces';
import { IOrderItemResponsePagarme } from '../interfaces/items/pagarme-orders-items-response.interfaces';

@Injectable()
export class PagarmeOrderItemsService {
  constructor(private pagarmeService: PagarmeService) { }

  async getOrderItemPagarme(
    orderId: string,
    itemId: string,
  ): Promise<IOrderItemResponsePagarme> {
    const response = await this.pagarmeService.axios.get(`/orders/${orderId}/items/${itemId}`);
    return response.data;
  }

  async includeOrderItemPagarme(
    orderId: string,
    itemInfo: IIncludeOrderItemPagarme,
  ): Promise<IOrderItemResponsePagarme> {
    const response = await this.pagarmeService.axios.post(`/orders/${orderId}/items`, itemInfo);
    return response.data;
  }

  async editOrderItemPagarme(
    orderId: string,
    itemId: string,
    itemInfo: IEditOrderItemPagarme,
  ): Promise<IOrderItemResponsePagarme> {
    const response = await this.pagarmeService.axios.put(`/orders/${orderId}/items/${itemId}`, itemInfo);
    return response.data;
  }

  async removeOrderItemPagarme(
    orderId: string,
    itemId: string,
  ): Promise<IOrderItemResponsePagarme> {
    const response = await this.pagarmeService.axios.delete(`/orders/${orderId}/items/${itemId}`);
    return response.data;
  }

  async removeAllOrderItemPagarme(
    orderId: string,
    itemId: string,
  ): Promise<IOrderItemResponsePagarme> {
    const response = await this.pagarmeService.axios.delete(`/orders/${orderId}/items/${itemId}`);
    return response.data;
  }
}
