import { Prisma } from '@prisma/client';

export const QBasicSubscriptionInfo = Prisma.validator<Prisma.BasicPlanSubscriptionsSelect>()({
  userSubscriptionId: true,
  cycleStart: true,
  cycleEnd: true,
});
