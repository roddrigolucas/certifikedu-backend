import { Prisma } from "@prisma/client";
import {QLearningPaths, QPublicLearningPaths} from '../querys/paths.querys';

export type TCreateLearningPathInput = Prisma.LearningPathsCreateInput;
export type TUpdateLearningPathInput = Prisma.LearningPathsUpdateInput;

export type TLearningPath = Prisma.LearningPathsGetPayload<{
  select: typeof QLearningPaths;
}>;

export type TPublicLearningPath = Prisma.LearningPathsGetPayload<{
  select: typeof QPublicLearningPaths;
}>;
