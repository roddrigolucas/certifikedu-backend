import { Prisma } from '@prisma/client';

export type TCustomerWithSubscriptionOutput = Prisma.PagarmeCustomersGetPayload<{
  include: { pagarmePlanSubscriptions: true };
}>;

export type TCustomerOutput = Prisma.PagarmeCustomersGetPayload<{}>;

export type TCustomerCreateInput = Prisma.PagarmeCustomersCreateInput;
export type TCustomerUpdateInput = Prisma.PagarmeCustomersUpdateInput;
