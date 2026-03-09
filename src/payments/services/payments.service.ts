import { Injectable } from '@nestjs/common';
import { QuotaPeriod } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TUserPfOutput } from '../../users/types/user.types';
import { IUserCards } from '../interfaces/cards.interface';
import { IUserCertificatePaymentInfo, IUserCreditsInfo, PaymentType } from '../interfaces/payments.interfaces';
import { CardsService } from './cards.service';
import { CustomerService } from './customer.service';
import { InternalPlansService } from './internal-plans.service';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly customerService: CustomerService,
    private readonly cardsService: CardsService,
    private readonly internalPlansService: InternalPlansService,
    private readonly subscriptionsService: SubscriptionsService,
  ) { }

  async getUserEmmitedCertificatesOnActiveCycle(userId: string, cycleStart: Date): Promise<number> {
    return await this.prismaService.certificates.count({
      where: {
        emissorId: userId,
        paymentType: { notIn: ['credit', 'free'] },
        createdAt: { gt: cycleStart },
      },
    });
  }

  async invalidateCertificateCredit(creditId: string) {
    await this.prismaService.certificatesCredits.update({
      where: { CertificateCreditId: creditId },
      data: {
        isValid: false,
        usedAt: new Date(),
      },
    });
  }

  async getUserCertificateCredit(customerId: string): Promise<string> {
    const certificateCredit = await this.prismaService.certificatesCredits.findFirst({
      where: { customerId: customerId, isValid: true },
      orderBy: { createdAt: 'asc' },
      select: { CertificateCreditId: true },
    });

    return certificateCredit.CertificateCreditId;
  }

  async getUserAvailableCertificateCredis(customerId: string): Promise<number> {
    return await this.prismaService.certificatesCredits.count({
      where: { isValid: true, customerId: customerId },
    });
  }

  async checkUserPfCertificatePayment(userId: string): Promise<IUserCertificatePaymentInfo> {
    const subscription = await this.subscriptionsService.getUserSubscriptionInfo(userId);

    if (subscription.emittedCertificatesPeriod === QuotaPeriod.unlimited) {
      return {
        isValid: true,
        type: subscription.subType === 'pagarme' ? PaymentType.pagarme : PaymentType.basic,
        id: subscription.subscriptionId,
        next_date: subscription.cycleEnd,
      };
    }

    const emmitedCertificates = await this.getUserEmmitedCertificatesOnActiveCycle(userId, subscription.cycleStart);

    const subscriptionCredits = subscription.emittedCertificatesQuota - emmitedCertificates;

    if (subscriptionCredits > 0) {
      return {
        isValid: true,
        type: subscription.subType === 'pagarme' ? PaymentType.pagarme : PaymentType.basic,
        id: subscription.subscriptionId,
        next_date: subscription.cycleEnd,
      };
    }

    const customerId = await this.customerService.getCustomerIdByUserId(userId);
    const creditId = await this.getUserCertificateCredit(customerId);

    if (creditId) {
      return {
        isValid: true,
        type: PaymentType.credit,
        id: creditId,
        next_date: subscription.cycleEnd,
      };
    }

    return { isValid: false, type: PaymentType.none, id: null, next_date: subscription.cycleEnd };
  }

  async getUserCards(userId: string): Promise<Array<IUserCards>> {
    const cards = await this.cardsService.getUserCardsRecords(userId);

    return cards.map((card) => {
      return {
        userId: card.cardId,
        customerId: card.customerId,
        cardId: card.cardId,
        lastFourDigits: card.last_four_digits,
        expMonth: card.exp_month,
        expYear: card.exp_year,
        brand: card.brand,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        isDefault: card.isDefault,
      };
    });
  }

  async getUserDefaultCardId(userId: string): Promise<string> {
    const cardId = await this.cardsService.getUserDefaultCardId(userId);

    if (!cardId) {
      return null;
    }

    return cardId;
  }

  async getUserCredits(userId: string): Promise<IUserCreditsInfo> {
    const customerId = await this.customerService.getCustomerIdByUserId(userId);

    const subscription = await this.subscriptionsService.getUserSubscriptionInfo(userId);

    const additionalCredits = await this.getUserAvailableCertificateCredis(customerId);

    const monthSpentCredits = await this.getUserEmmitedCertificatesOnActiveCycle(userId, subscription.cycleStart);

    return {
      customerId: customerId,
      plan: subscription.name,
      planId: subscription.planId,
      subsciptionId: subscription.subscriptionId,
      nextCertificateDate: subscription.cycleEnd,
      monthSpentCredits: monthSpentCredits,
      additionalCertificatesCredits: additionalCredits,
      certificateCredits: subscription.emittedCertificatesQuota,
    };
  }

  async addNewUserToPaymentsInfra(user: TUserPfOutput) {
    await this.customerService.createCustomer({ userId: user.id, ...user.pessoaFisica });
  }

  async createRawUserSubscription(userId: string) {
    await this.subscriptionsService.createUserBasicSubscription(userId);
  }

  async getUserCertificatePrice(userId: string): Promise<number> {
    const planId = await this.prismaService.userPlans.findFirst({
      where: { userId: userId },
      select: {
        pagarme: { select: { PagarmePlans: { select: { singleCertificatePrice: true } } } },
        basicSubscription: { select: { plan: { select: { singleCertificatePrice: true } } } },
      },
    });

    if (planId?.pagarme?.PagarmePlans?.singleCertificatePrice) {
      return planId?.pagarme.PagarmePlans.singleCertificatePrice;
    }

    if (planId?.basicSubscription?.plan?.singleCertificatePrice) {
      return planId.basicSubscription.plan.singleCertificatePrice;
    }

    //const newSubPlanId = await this.subscriptionsService.createUserBasicSubscription(userId);

    const defaultPlan = await this.internalPlansService.getInternalPlanDefault();
    return defaultPlan.singleCertificatePrice;
  }
}
