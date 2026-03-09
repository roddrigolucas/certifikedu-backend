import { Prisma } from '@prisma/client';

export type TSemesterCreateInput = Prisma.SemesterCreateInput;
export type TSemesterCreateManyInput = Prisma.SemesterCreateManyInput;
export type TSemesterUpdateInput = Prisma.SemesterUpdateInput;
export type TSemesterWhereInput = Prisma.SemesterWhereInput;
export type TSemesterCreateWithoutCurriculumInput = Prisma.SemesterCreateWithoutCurriculumInput

export type TSemesterWithAllOutput = Prisma.SemesterGetPayload<{
  include: {
    subjects: { include: { subject: true } };
    curriculum: { include: { course: { include: { schools: { include: { school: true } } } } } };
  };
  orderBy: { semesterNumber: 'desc' };
}>;

export type TSemesterWithSubjectsOutput = Prisma.SemesterGetPayload<{
  include: { subjects: { include: { subject: true } } };
  orderBy: { semesterNumber: 'desc' };
}>;
