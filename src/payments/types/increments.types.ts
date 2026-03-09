import { Prisma } from '@prisma/client';

export type TIncrementOutput = Prisma.PagarmeIncrementsGetPayload<{}>;

export type TIncrementOnSubsUpdateManyInput = Prisma.IncrementOnSubscriptionUpdateManyWithWhereWithoutIncrementInput;
export type TIncrementOnSubsItemUpdateManyInput = Prisma.IncrementOnItemUpdateManyWithWhereWithoutIncrementInput;
