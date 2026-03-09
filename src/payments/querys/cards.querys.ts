import { Prisma } from '@prisma/client';

export const QUserCardForProfile = Prisma.validator<Prisma.PagarmeCardsSelect>()({
  customerId: true,
  cardId: true,
  last_four_digits: true,
  exp_month: true,
  exp_year: true,
  createdAt: true,
  updatedAt: true,
  brand: true,
  isDefault: true,
});


