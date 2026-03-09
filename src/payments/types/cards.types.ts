import { Prisma } from '@prisma/client';
import { QUserCardForProfile } from '../querys/cards.querys';

export type TCardCreateInput = Prisma.PagarmeCardsCreateInput;

export type TCardUpdateInput = Prisma.PagarmeCardsUpdateInput;



export type TCardOutput = Prisma.PagarmeCardsGetPayload<{}>;

export type TCardsForPfProfileOutput = Prisma.PagarmeCardsGetPayload<{
  select: { [K in keyof typeof QUserCardForProfile]: true };
}>;

export type TCardsUpdateManyInput = Prisma.PagarmeCardsUpdateManyWithWhereWithoutCustomerInput;
