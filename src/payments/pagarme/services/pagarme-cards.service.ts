import { Injectable } from '@nestjs/common';
import { ICreateCardPagarme, IEditCardPagarme } from '../interfaces/cards/pagarme-cards-input.interfaces';
import { ICardResponsePagarme, IListCardsResponsePagarme } from '../interfaces/cards/pagarme-cards-response.interfaces';
import { PagarmeService } from './pagarme.service';

@Injectable()
export class PagarmeCardsService {
  constructor(private readonly pagarmeService: PagarmeService) { }

  async createCustomerCardPagarme(customerId: string, cardInfo: ICreateCardPagarme): Promise<ICardResponsePagarme> {
    const response = await this.pagarmeService.axios.post(`/customers/${customerId}/cards`, cardInfo);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async getCustomerCardPagarme(customerId: string, cardId: string): Promise<ICardResponsePagarme> {
    const response = await this.pagarmeService.axios.get(`/customers/${customerId}/cards/${cardId}`);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async editCustomerCardPagarme(
    customerId: string,
    cardId: string,
    cardInfo: IEditCardPagarme,
  ): Promise<ICardResponsePagarme> {
    const response = await this.pagarmeService.axios.put(`/customers/${customerId}/cards/${cardId}`, cardInfo);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

  async deleteCustomerCardPagarme(customerId: string, cardId: string): Promise<ICardResponsePagarme> {
    return await this.pagarmeService.axios.delete(`/customers/${customerId}/cards/${cardId}`);
  }

  async listCustomerCardsPagarme(customerId: string): Promise<IListCardsResponsePagarme> {
    const response = await this.pagarmeService.axios.get(`/customers/${customerId}/cards`);

    if (!response.data) {
      return null;
    }

    return response.data;
  }

}
