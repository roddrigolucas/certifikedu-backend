import { Prisma } from '@prisma/client';
import { QPagarmePlanInfo, QBasicPlanInfo, QUserPlanBasicSubscriptionInfo } from '../querys/plans.querys';

export type TBasicPlanInfoOutput = Prisma.BasicPlansGetPayload<{}>;

export type TPagarmePlanInfoOutput = Prisma.PagarmePlansGetPayload<{
  include: { items: true };
}>;

export type TPagarmeBasicPlanInfoOutput = Prisma.PagarmePlansGetPayload<{
  select: {
    createdAt: true;
    planName: true;
    recommendend: true;
    montlhyPrice: true;
    receivedCertificateQuota: true;
    planId: true;
    emittedCertificatesQuota: true;
  };
}>;

export type TBasicPlanOutput = Prisma.BasicPlansGetPayload<{
  select: typeof QBasicPlanInfo;
}>;

export type TUserBasicPlanOutput = Prisma.UserPlansGetPayload<{
  select: typeof QUserPlanBasicSubscriptionInfo;
}>;

export type TPagarmePlanOutput = Prisma.PagarmePlansGetPayload<{
  select: typeof QPagarmePlanInfo;
}>;

export type TBasicPlanCreateInput = Prisma.BasicPlansCreateInput;
export type TBasicPlanUpdateInput = Prisma.BasicPlansUpdateInput;

export type TPagarmePlanCreateInput = Prisma.PagarmePlansCreateInput;
export type TPagarmePlanUpdateInput = Prisma.PagarmePlansUpdateInput;

export type TPagarmePlanItemCreateInput = Prisma.PagarmePlanItemsCreateInput;
export type TPagarmePlanItemUpdateInput = Prisma.PagarmePlanItemsUpdateInput;
