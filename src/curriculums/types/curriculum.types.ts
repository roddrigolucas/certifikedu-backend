import { Prisma } from '@prisma/client';

export type TCurriculumCreateInput = Prisma.CurriculumCreateInput;
export type TCurriculumUpdateInput = Prisma.CurriculumUpdateInput;

export type TCurriculumWithAllOutput = Prisma.CurriculumGetPayload<{
  include: {
    course: { include: { schools: { include: { school: true } } } };
    activities: { include: { activity: true } };
    internships: { include: { internship: true } };
    semesters: { include: { subjects: { include: { subject: true } } } };
  };
}>;

