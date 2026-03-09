import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IIncrementResponsePagarme } from '../pagarme/subscriptions/interfaces/increments/pagarme-subscriptions-increments-response.interfaces';
import { PagarmeSubIncrementsService } from '../pagarme/subscriptions/services/pagarme-increments.service';
import { TIncrementOnSubsItemUpdateManyInput, TIncrementOnSubsUpdateManyInput } from '../types/increments.types';

@Injectable()
export class IncrementsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pagarmeIncrementsService: PagarmeSubIncrementsService,
  ) { }

  async updateSubscriptionsIncrementsRecords(data: Array<TIncrementOnSubsUpdateManyInput>) {
    await this.prismaService.incrementOnSubscription.updateMany({
      data: data,
    });
  }

  async updateSubscriptionIncrements(subscriptionId: string, increments: Array<IIncrementResponsePagarme>) {
    const incrementData = increments.map((increment) => {
      return {
        where: { pagarmeIncrementId: increment.id, suscriptionId: subscriptionId },
        data: {
          status: increment.status,
          cycle: increment.cycles ?? 0,
        },
      };
    });

    await this.updateSubscriptionsIncrementsRecords(incrementData);
  }

  async updateSubscriptionItemIncrements(itemId: string, increments: Array<IIncrementResponsePagarme>) {
    const incrementData = increments.map((increment) => {
      return {
        where: { pagarmeIncrementId: increment.id, subscriptionItemId: itemId },
        data: {
          status: increment.status,
          cycle: increment.cycles ?? 0,
        },
      };
    });

    await this.updateSubscriptionsIncrementsRecords(incrementData);
  }

  async updateSubscriptionsItemsIncrementsRecords(data: Array<TIncrementOnSubsItemUpdateManyInput>) {
    await this.prismaService.incrementOnItem.updateMany({
      data: data,
    });
  }
}
