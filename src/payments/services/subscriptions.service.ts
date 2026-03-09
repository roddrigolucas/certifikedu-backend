import { Injectable } from '@nestjs/common';
import { PaymentMethodEnum } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserSubscriptionInfo } from '../interfaces/subscriptions.interfaces';
import { ICreatePlannedSubscriptionPagarme } from '../pagarme/subscriptions/interfaces/subscriptions/pagarme-subscriptions-input.interfaces';
import { ISubscriptionResponsePagarme } from '../pagarme/subscriptions/interfaces/subscriptions/pagarme-subscriptions-response.interfaces';
import { PagarmeSubscriptionsService } from '../pagarme/subscriptions/services/pagarme-subscriptions.service';
import { CyclesService } from './cycles.service';
import { DiscountsService } from './discounts.service';
import { IncrementsService } from './increments.service';
import { SubscriptionsItemsService } from './subscription-items.service';
import {
  QBasicPlanInfo,
  QUserPlanBasicSubscriptionInfo,
  QUserPlanPagarmeSubscriptionInfo,
} from '../querys/plans.querys';
import { QBasicSubscriptionInfo } from '../querys/subscriptions.querys';
import { TBasicPlanOutput } from '../types/plans.types';
import {
  TBasicSubscriptionOutput,
  TBasicSubscriptionUpdateInput,
  TSubscriptionCreateInput,
  TSubscriptionOutput,
  TSubscriptionUpdateInput,
} from '../types/subscriptions.types';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pagarmeSubscriptionService: PagarmeSubscriptionsService,
    private readonly subscriptionItemsService: SubscriptionsItemsService,
    private readonly discountsService: DiscountsService,
    private readonly incrementsService: IncrementsService,
    private readonly cyclesService: CyclesService,
  ) { }

  async getUserSubscriptionInfo(userId: string): Promise<IUserSubscriptionInfo> {
    const userSubId = await this.prismaService.userPlans.findFirst({
      where: { userId: userId },
      select: {
        pagarme: { select: { subscriptionId: true, cycleEnd: true } },
        basicSubscription: { select: { userSubscriptionId: true } },
      },
    });

    if (userSubId?.pagarme?.subscriptionId) {
      if (userSubId.pagarme.cycleEnd.getTime() > new Date().getTime() - 24 * 60 * 60 * 1000) {
        await this.refreshUserSubscription(userSubId.pagarme.subscriptionId);
      }

      const userSubs = await this.prismaService.userPlans.findFirst({
        where: { userId: userId },
        select: QUserPlanPagarmeSubscriptionInfo,
      });

      return {
        subType: 'pagarme',
        name: userSubs.pagarme.PagarmePlans.planName,
        subscriptionId: userSubs.pagarme.subscriptionId,
        cycleStart: userSubs.pagarme.cycleStart,
        cycleEnd: userSubs.pagarme.cycleEnd,
        ...userSubs.pagarme.PagarmePlans,
      };
    }

    return await this.refreshUserBasicSubscription(userId);
  }

  async getBasicPlanInfo(): Promise<TBasicPlanOutput> {
    return await this.prismaService.basicPlans.findFirst({
      where: { isDefault: true },
      select: QBasicPlanInfo,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBasicPlanId(): Promise<string> {
    return (
      await this.prismaService.basicPlans.findFirst({
        where: { isDefault: true },
        select: { planId: true },
        orderBy: { createdAt: 'desc' },
      })
    ).planId;
  }

  async createSubscriptionRecord(data: TSubscriptionCreateInput): Promise<TSubscriptionOutput> {
    return this.prismaService.pagarmePlanSubscription.create({
      data: data,
    });
  }

  async updateSubscriptionRecord(subscriptionId: string, data: TSubscriptionUpdateInput): Promise<TSubscriptionOutput> {
    return this.prismaService.pagarmePlanSubscription.update({
      where: { subscriptionId: subscriptionId },
      data: data,
    });
  }

  async createUserBasicSubscription(userId: string): Promise<string> {
    const planId = await this.getBasicPlanId();

    if (!planId) {
      return null;
    }

    const date = new Date();

    return (
      await this.prismaService.userPlans.create({
        data: {
          userId: userId,
          basicSubscription: {
            create: {
              cycleStart: date,
              cycleEnd: new Date(date.setDate(new Date().getDate() + 30)),
              planId: planId,
            },
          },
        },
        select: { userPlanId: true },
      })
    ).userPlanId;
  }

  async createPlannedSubscription(
    subInfo: ICreatePlannedSubscriptionPagarme,
    discountCode?: string,
  ): Promise<TSubscriptionOutput> {
    const subscription = await this.pagarmeSubscriptionService.createPlannedSubscriptionPagarme(subInfo);

    if (!subscription) {
      return null;
    }

    return this.createSubscription(subscription, discountCode);
  }

  async cancelPlannedSubscription(subscriptionId: string): Promise<TSubscriptionOutput> {
    const subscription = await this.pagarmeSubscriptionService.cancelSubscriptionPagarme(subscriptionId, {
      cancel_pending_invoices: true,
    });

    if (!subscription) {
      return null;
    }

    this.refreshUserSubscription(subscriptionId);
  }

  async createSubscription(
    subscription: ISubscriptionResponsePagarme,
    discountCode?: string,
  ): Promise<TSubscriptionOutput> {
    const subscriptionData: TSubscriptionCreateInput = {
      subscriptionId: subscription.id,
      subscriptionCreatedAt: new Date(subscription.created_at),
      subscriptionStartedAt: new Date(subscription.start_at),
      subscriptionUpdatedAt: new Date(subscription.created_at),
      paymentMethod: subscription.payment_method as PaymentMethodEnum,
      currency: subscription.currency,
      interval: subscription.interval,
      intervalCount: subscription.interval_count,
      minimumPrice: subscription.minimum_price,
      billingType: subscription.billing_type,
      cycleStart: subscription.current_cycle.start_at,
      cycleEnd: subscription.current_cycle.end_at,
      price: subscription.items.reduce((c, item) => {
        return c + item.pricing_scheme.price;
      }, 0),
      installments: subscription.installments,
      start_at: subscription.start_at,
      status: 'active',
      PagarmePlans: { connect: { planId: subscription.plan.id } },
      customer: { connect: { customerId: subscription.customer.id } },
      card: { connect: { cardId: subscription.card.id } },
      items: {
        createMany: {
          data: subscription.items.map((item) => {
            return {
              subscriptionItemId: item.id,
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              price: item.pricing_scheme.price,
              cycles: item?.cycles ?? 0,
              schemeType: item.pricing_scheme.scheme_type,
            };
          }),
        },
      },
    };

    if (subscription.discounts) {
      subscriptionData.discounts.createMany.data = await this.discountsService.getSubscriptionDiscountsObjects(
        subscription.discounts,
        discountCode,
      );
    }

    const subscriptionRecord = await this.createSubscriptionRecord(subscriptionData);

    await this.cyclesService.updateSubscriptionCycles(subscription.id);

    return subscriptionRecord;
  }

  async refreshUserSubscription(subscriptionId: string) {
    const subscription = await this.pagarmeSubscriptionService.getSubscriptionPagarme(subscriptionId);

    if (!subscription) {
      return null
    }

    const subscriptionData: TSubscriptionUpdateInput = {
      subscriptionStartedAt: new Date(subscription.start_at),
      subscriptionUpdatedAt: new Date(subscription.created_at),
      paymentMethod: subscription.payment_method as PaymentMethodEnum,
      currency: subscription.currency,
      interval: subscription.interval,
      intervalCount: subscription.interval_count,
      minimumPrice: subscription.minimum_price,
      billingType: subscription.billing_type,
      cycleStart: subscription.current_cycle.start_at,
      cycleEnd: subscription.current_cycle.end_at,
      price: subscription.items.reduce((c, item) => {
        return c + item.pricing_scheme.price;
      }, 0),
      installments: subscription.installments,
      start_at: subscription.start_at,
      status: subscription.status,
    };

    if (subscription.discounts) {
      await this.discountsService.updateSubscriptionDiscounts(subscription.id, subscription.discounts);
    }

    if (subscription.increments) {
      await this.incrementsService.updateSubscriptionIncrements(subscription.id, subscription.increments);
    }

    await this.subscriptionItemsService.updateSubscriptionItems(subscription.items);

    await this.cyclesService.updateSubscriptionCycles(subscription.id);

    await this.updateSubscriptionRecord(subscriptionId, subscriptionData);
  }

  async refreshUserBasicSubscription(userId: string): Promise<IUserSubscriptionInfo> {
    const userSubs = await this.prismaService.userPlans.findFirst({
      where: { userId: userId },
      select: QUserPlanBasicSubscriptionInfo,
    });

    if (!userSubs) {
      return {
        subType: 'basic',
        cycleStart: new Date(),
        cycleEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        subscriptionId: await this.createUserBasicSubscription(userId),
        ...(await this.getBasicPlanInfo()),
      };
    }

    if (userSubs.basicSubscription.cycleEnd.getTime() <= new Date().getTime()) {
      const subscriptionData: TBasicSubscriptionUpdateInput = {
        cycleStart: new Date(),
        cycleEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        isActive: true,
      };

      const sub = await this.updateBasicSubscriptionRecord(userSubs.basicSubscription.userSubscriptionId, subscriptionData);

      return {
        subType: 'basic',
        name: userSubs.basicSubscription.plan.name,
        subscriptionId: userSubs.basicSubscription.userSubscriptionId,
        cycleStart: sub.cycleStart,
        cycleEnd: sub.cycleEnd,
        ...userSubs.basicSubscription.plan,
      };
    }

    return {
      subType: 'basic',
      name: userSubs.basicSubscription.plan.name,
      subscriptionId: userSubs.basicSubscription.userSubscriptionId,
      cycleStart: userSubs.basicSubscription.cycleStart,
      cycleEnd: userSubs.basicSubscription.cycleEnd,
      ...userSubs.basicSubscription.plan,
    };
  }

  async updateBasicSubscriptionRecord(
    subscriptionId: string,
    data: TBasicSubscriptionUpdateInput,
  ): Promise<TBasicSubscriptionOutput> {
    return await this.prismaService.basicPlanSubscriptions.update({
      where: { userSubscriptionId: subscriptionId },
      data: data,
      select: QBasicSubscriptionInfo,
    });
  }
}
