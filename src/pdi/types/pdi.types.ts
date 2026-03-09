import { Prisma } from '@prisma/client';
import { listPdiQuery, pdiWithNodes } from '../querys/pdi.querys';

export type TPdiCreateInput = Prisma.PdiCreateInput;

export type TPdiUpdateInput = Prisma.PdiUpdateInput;

export type TPdiWithNodesOutput = Prisma.PdiGetPayload<{
  select: typeof pdiWithNodes;
}>;

export type TPdiOutput = Prisma.PdiGetPayload<{
  select: typeof listPdiQuery;
}>;
