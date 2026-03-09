import { Prisma } from '@prisma/client';
import { QBasicFontInfo } from '../querys/fonts.querys';

export type TFontBasicOutput = Prisma.FontsGetPayload<{
  select: typeof QBasicFontInfo;
}>;
