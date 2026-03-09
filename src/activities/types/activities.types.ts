import { Prisma } from '@prisma/client';

export type TActivitesAndCurriculumOutput = Prisma.ActivitiesGetPayload<{
  include: { curriculum: true };
}>;

export type TActivityAndStudyFieldAllOutput = Prisma.ActivitiesGetPayload<{
  include: {
    studyFields: {
      include: {
        abilities: { include: { abilities: true } };
        subjects: true;
        internships: true;
      };
    };
  };
}>;

export type TActivitiesCreateInput = Prisma.ActivitiesCreateInput;

export type TActivitiesUpdateInput = Prisma.ActivitiesUpdateInput;

export type TActivitiesCreateManyInput = Prisma.ActivitiesCreateManyInput;

export type TActivitiesWhereInput = Prisma.ActivitiesWhereInput;

