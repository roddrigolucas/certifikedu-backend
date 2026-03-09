import { Prisma } from '@prisma/client';

export const QBasicFontInfo = Prisma.validator<Prisma.FontsSelect>()({
  fontId: true,
  family: true,
  category: true,
  ttfUrl: true,
});

