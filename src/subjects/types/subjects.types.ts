import { Prisma } from '@prisma/client';

export type TSubjectCreateInput = Prisma.SubjectsCreateInput;
export type TSubjectCreateManyInput = Prisma.SubjectsCreateManyInput;
export type TSubjectUpdateInput = Prisma.SubjectsUpdateInput;
export type TSubjectWhereInput = Prisma.SubjectsWhereInput;

export type TSubjectWithSemesterOutput = Prisma.SubjectsGetPayload<{
  include: { 
    semesters: true,
    studyFields: true
  };
}>;

