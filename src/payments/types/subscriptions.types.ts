import { Prisma } from "@prisma/client";
import { QBasicSubscriptionInfo } from "../querys/subscriptions.querys";


export type TBasicSubscriptionOutput = Prisma.BasicPlanSubscriptionsGetPayload<{
  select: typeof QBasicSubscriptionInfo
}>;

export type TSubscriptionOutput = Prisma.PagarmePlanSubscriptionGetPayload<{}>;

export type TSubscriptionCreateInput = Prisma.PagarmePlanSubscriptionCreateInput;

export type TSubscriptionUpdateInput = Prisma.PagarmePlanSubscriptionUpdateInput;

export type TBasicSubscriptionUpdateInput = Prisma.BasicPlanSubscriptionsUpdateInput;


