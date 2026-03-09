import { Prisma } from '@prisma/client';

export type TDiscountOutput = Prisma.PagarmeDiscountsGetPayload<{}>;

export type TDiscountOnSubsUpdateManyInput = Prisma.DiscountOnSubscriptionUpdateManyWithWhereWithoutDiscountInput;
export type TDiscountOnSubsItemUpdateManyInput = Prisma.DiscountOnItemUpdateManyWithWhereWithoutDiscountInput;
