import { QuotaPeriod } from '@prisma/client';

export interface IUserSubscriptionInfo {
  subType: 'basic' | 'pagarme';
  subscriptionId: string;
  name: string;
  planId: string;
  pdisQty: number;
  pdiPeriod: QuotaPeriod;
  emittedCertificatesQuota: number;
  emittedCertificatesPeriod: QuotaPeriod;
  receivedCertificateQuota: number;
  receivedCertificatePeriod: QuotaPeriod;
  cycleStart: Date;
  cycleEnd: Date;
}

export interface ICreatePlannedSubscription {
  userId: string;
  planId: string;
  cardId: string;
  installments: number;
  start_at: Date;
  customerId: string;
  discount_code: string;
}
