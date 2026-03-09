import { Prisma } from '@prisma/client';

export type TInternshipCreateInput = Prisma.InternshipsCreateInput;
export type TInternshipUpdateInput = Prisma.InternshipsUpdateInput;
export type TInternshipWhereInput = Prisma.InternshipsWhereInput;

export type TInternshipCreateManyInput = Prisma.InternshipsCreateManyInput;

export type TIntershipWithCurriculumOutput = Prisma.InternshipsGetPayload<{
  include: { curriculums: true };
}>;

