import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICreateCardPagarme, IEditCardPagarme } from '../pagarme/interfaces/cards/pagarme-cards-input.interfaces';
import { PagarmeCardsService } from '../pagarme/services/pagarme-cards.service';
import { QUserCardForProfile } from '../querys/cards.querys';
import {
  TCardCreateInput,
  TCardOutput,
  TCardsForPfProfileOutput,
  TCardsUpdateManyInput,
  TCardUpdateInput,
} from '../types/cards.types';
import { AddressService } from './address.service';

@Injectable()
export class CardsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pagarmeCardsService: PagarmeCardsService,
    private readonly addressService: AddressService,
  ) { }

  async checkCardById(cardId: string, customerId: string): Promise<string> {
    const card = await this.refreshUserCard(customerId, cardId);

    if (!card || card?.status !== 'active') {
      return null;
    }

    return card.cardId;
  }

  async getUserDefaultCardId(userId: string): Promise<string> {
    const card = await this.prismaService.pagarmeCards.findFirst({
      where: { AND: [{ customer: { userId: userId } }, { isDefault: true }] },
    });

    if (!card) {
      return null;
    }

    return card.cardId;
  }

  async getUserCardsRecords(userId: string): Promise<Array<TCardsForPfProfileOutput>> {
    return await this.prismaService.pagarmeCards.findMany({
      where: { customer: { userId: userId }, status: 'active' },
      select: QUserCardForProfile,
    });
  }

  async createCardRecord(cardData: TCardCreateInput): Promise<TCardOutput> {
    return await this.prismaService.pagarmeCards.create({
      data: cardData,
    });
  }

  async updateCardRecord(cardId: string, cardData: TCardUpdateInput): Promise<TCardOutput> {
    return await this.prismaService.pagarmeCards.update({
      where: { cardId: cardId },
      data: cardData,
    });
  }

  async updateManyCardRecord(cardData: Array<TCardsUpdateManyInput>) {
    return await this.prismaService.pagarmeCards.updateMany({
      data: cardData,
    });
  }

  async createCustomerCard(customerId: string, cardInfo: ICreateCardPagarme): Promise<TCardOutput> {
    const card = await this.pagarmeCardsService.createCustomerCardPagarme(customerId, cardInfo);

    if (!card) {
      return null;
    }

    const cardData: TCardCreateInput = {
      cardId: card.id,
      cardCreatedAt: card.created_at,
      cardUpdatedAt: card.updated_at,
      first_six_digits: card.first_six_digits,
      last_four_digits: card.last_four_digits,
      brand: card.brand,
      holder_name: card.holder_name,
      holder_document: card.holder_document,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      status: card.status,
      customer: { connect: { customerId: customerId } },
    };

    if (card.billing_address) {
      const addressId = await this.addressService.checkCustomerCardAddress(customerId, card.billing_address);
      if (addressId) {
        cardData.addresses = { connect: { addressId: addressId }};
      }
    }

    return this.createCardRecord(cardData);
  }

  async setUserCardDefault(cardId: string, customerId: string) {
    const queryDefault = this.prismaService.pagarmeCards.update({
      where: { cardId: cardId },
      data: { isDefault: true },
    });

    const queryNonDefault = this.prismaService.pagarmeCards.updateMany({
      where: { AND: [{ cardId: { not: cardId } }, { customerId: customerId }] },
      data: { isDefault: false },
    });

    const [card, _] = await this.prismaService.$transaction([queryDefault, queryNonDefault]);

    return card;
  }

  async editUserCard(customerId: string, cardId: string, cardInfo: IEditCardPagarme): Promise<TCardOutput> {
    const card = await this.pagarmeCardsService.editCustomerCardPagarme(customerId, cardId, cardInfo);

    if (!card) {
      return null;
    }

    const cardData: TCardUpdateInput = {
      cardCreatedAt: card.created_at,
      cardUpdatedAt: card.updated_at,
      first_six_digits: card.first_six_digits,
      last_four_digits: card.last_four_digits,
      brand: card.brand,
      holder_name: card.holder_name,
      holder_document: card.holder_document,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      status: card.status,
    };

    return await this.updateCardRecord(cardId, cardData);
  }

  async refreshUserCard(customerId: string, cardId: string): Promise<TCardOutput> {
    const card = await this.pagarmeCardsService.getCustomerCardPagarme(customerId, cardId);

    if (!card) {
      return null;
    }

    const cardData: TCardUpdateInput = {
      cardId: card.id,
      cardCreatedAt: card.created_at,
      cardUpdatedAt: card.updated_at,
      first_six_digits: card.first_six_digits,
      last_four_digits: card.last_four_digits,
      brand: card.brand,
      holder_name: card.holder_name,
      holder_document: card.holder_document,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      status: card.status,
    };

    return await this.updateCardRecord(cardId, cardData);
  }

  async deleteCustomerCard(customerId: string, cardId: string): Promise<boolean> {
    const card = await this.pagarmeCardsService.deleteCustomerCardPagarme(customerId, cardId);

    if (!card) {
      return false;
    }

    const cardData: TCardUpdateInput = {
      cardCreatedAt: card.created_at,
      cardUpdatedAt: card.updated_at,
      first_six_digits: card.first_six_digits,
      last_four_digits: card.last_four_digits,
      brand: card.brand,
      holder_name: card.holder_name,
      holder_document: card.holder_document,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      status: card.status,
    };

    await this.updateCardRecord(cardId, cardData);

    return true;
  }

  async refreshCustomerCards(customerId: string) {
    const cards = await this.pagarmeCardsService.listCustomerCardsPagarme(customerId);

    if (!cards.data) {
      return null;
    }

    await this.updateManyCardRecord(
      cards.data.map((card) => {
        return {
          where: { cardId: card.id },
          data: {
            cardCreatedAt: card.created_at,
            cardUpdatedAt: card.updated_at,
            first_six_digits: card.first_six_digits,
            last_four_digits: card.last_four_digits,
            brand: card.brand,
            holder_name: card.holder_name,
            holder_document: card.holder_document,
            exp_month: card.exp_month,
            exp_year: card.exp_year,
            status: card.status,
          },
        };
      }),
    );
  }
}
