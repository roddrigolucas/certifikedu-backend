import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ISubscriptionItemResponsePagarme } from "../pagarme/subscriptions/interfaces/items/pagarme-subscriptions-items-response.interfaces";
import { PagarmeSubItemsService } from "../pagarme/subscriptions/services/pagarme-items.service";
import { TSubscriptionItemsUpdateManyInput } from "../types/subscription-items.types";
import { DiscountsService } from "./discounts.service";
import { IncrementsService } from "./increments.service";

@Injectable()
export class SubscriptionsItemsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pagarmeSubscriptionItemService: PagarmeSubItemsService,
    private readonly discountsService: DiscountsService,
    private readonly incrementsService: IncrementsService,
  ) { }

  async updateSubscriptionItemsRecords(data: Array<TSubscriptionItemsUpdateManyInput>) {
    await this.prismaService.pagarmeSubscriptionItems.updateMany({
      data: data,
    });
  }

  async updateSubscriptionItems(items: Array<ISubscriptionItemResponsePagarme>) {
    const itemsRecords = items.map((item) => {
      if (item.discounts) {
        this.discountsService.updateSubscriptionItemDiscounts(item.id, item.discounts);
      }

      if (item.increments) {
        this.incrementsService.updateSubscriptionItemIncrements(item.id, item.increments);
      }

      return {
        where: { subscriptionItemId: item.id },
        data: {
          subscriptionItemId: item.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.pricing_scheme.price,
          cycles: item.cycles,
          schemeType: item.pricing_scheme.scheme_type,
        },
      };
    });

    await this.updateSubscriptionItemsRecords(itemsRecords);
  }

}
