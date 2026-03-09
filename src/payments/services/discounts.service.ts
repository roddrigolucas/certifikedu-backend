import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICreateDiscountOnSubscription, IDiscountForSubs } from '../interfaces/discounts.interfaces';
import { IDiscountResponsePagarme } from '../pagarme/subscriptions/interfaces/discounts/pagarme-subscriptions-discounts-response.interfaces';
import { PagarmeSubDiscoutsService } from '../pagarme/subscriptions/services/pagarme-discounts.service';
import { TDiscountOnSubsItemUpdateManyInput, TDiscountOnSubsUpdateManyInput } from '../types/discounts.types';

@Injectable()
export class DiscountsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pagarmeDiscountsService: PagarmeSubDiscoutsService,
  ) { }

  async getDiscountByCode(discountCode: string): Promise<IDiscountForSubs> {
    const discount = await this.prismaService.pagarmeDiscounts.findUnique({
      where: { code: discountCode, expiresAt: { gt: new Date() }, isValid: true },
      select: {
        isFlat: true,
        value: true,
        cycles: true,
        total: true,
        subscriptions: {
          select: { subscriptionId: true },
        },
      },
    });

    if (!discount || discount.total <= discount.subscriptions.length) {
      return null;
    }

    return {
      isFlat: discount.isFlat,
      value: discount.value,
      cycles: discount.cycles,
    };
  }

  async getSubscriptionDiscountsObjects(
    discounts: Array<IDiscountResponsePagarme>,
    discountCode: string,
  ): Promise<Array<ICreateDiscountOnSubscription>> {
    if (!discountCode) {
      return [];
    }

    const discount = await this.prismaService.pagarmeDiscounts.findUnique({
      where: { code: discountCode },
    });

    return discounts.map((d) => {
      return {
        discountId: discount.discountId,
        pagarmeDiscountId: d.id,
        startedAt: new Date(d.created_at),
        expiresAt: new Date(new Date().getTime() + d.cycles * 30 * 24 * 60 * 60 * 1000),
        cycles: Array.from({ length: d.cycles }, (_, i) => i + 1),
      };
    });
  }

  async updateSubscriptionsDiscountsRecords(data: Array<TDiscountOnSubsUpdateManyInput>) {
    await this.prismaService.discountOnSubscription.updateMany({
      data: data,
    });
  }

  async updateSubscriptionDiscounts(subscriptionId: string, discounts: Array<IDiscountResponsePagarme>) {
    const discountData = discounts.map((discount) => {
      return {
        where: { pagarmeDiscountId: discount.id, subscriptionId: subscriptionId },
        data: {
          status: discount.status,
          cycle: discount.cycles ?? 0,
        },
      };
    });

    await this.updateSubscriptionsDiscountsRecords(discountData);
  }

  async updateSubscriptionItemDiscounts(itemId: string, discounts: Array<IDiscountResponsePagarme>) {
    const discountData = discounts.map((discount) => {
      return {
        where: { pagarmeDiscountId: discount.id, subscriptionItemId: itemId },
        data: {
          status: discount.status,
          cycle: discount.cycles ?? 0,
        },
      };
    });

    await this.updateSubscriptionsDiscountsRecords(discountData);
  }

  async updateSubscriptionsItemsDiscountsRecords(data: Array<TDiscountOnSubsItemUpdateManyInput>) {
    await this.prismaService.discountOnItem.updateMany({
      data: data,
    });
  }
}
