import { Prisma } from '@prisma/client';

export const QBasicPlanInfo = Prisma.validator<Prisma.BasicPlansSelect>()({
  planId: true,
  name: true,
  pdisQty: true,
  pdiPeriod: true,
  emittedCertificatesQuota: true,
  emittedCertificatesPeriod: true,
  receivedCertificateQuota: true,
  receivedCertificatePeriod: true,
});

export const QPagarmePlanInfo = Prisma.validator<Prisma.PagarmePlansSelect>()({
  planId: true,
  planName: true,
  pdisQty: true,
  pdiPeriod: true,
  emittedCertificatesQuota: true,
  emittedCertificatesPeriod: true,
  receivedCertificateQuota: true,
  receivedCertificatePeriod: true,
});


export const QUserPlanBasicSubscriptionInfo = Prisma.validator<Prisma.UserPlansSelect>()({
  basicSubscription: {
    where: { isActive: true },
    select: {
      userSubscriptionId: true,
      cycleStart: true,
      cycleEnd: true,
      plan: { select: QBasicPlanInfo },
    },
  },
});

export const QUserPlanPagarmeSubscriptionInfo = Prisma.validator<Prisma.UserPlansSelect>()({
  pagarme: {
    select: {
      subscriptionId: true,
      cycleStart: true,
      cycleEnd: true,
      PagarmePlans: { select: QPagarmePlanInfo },
    },
  },
});
