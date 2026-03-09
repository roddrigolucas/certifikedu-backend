import { Prisma } from '@prisma/client';


export type TStudyFieldCreateInput = Prisma.StudyFieldCreateInput;
export type TStudyFieldUpdateInput = Prisma.StudyFieldUpdateInput;

export type TStudyFieldAllOutput = Prisma.StudyFieldGetPayload<{
  include: {
    abilities: { include: { abilities: true } };
    subjects: true;
    internships: true;
    activities: true;
  };
}>;
