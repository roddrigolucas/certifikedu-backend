import { Prisma } from '@prisma/client';

export type TSchoolWithPjOutput = Prisma.SchoolsGetPayload<{
  include: {
    userId: true;
  };
}>;

export type TSchoolWithCredentialsOutput = Prisma.SchoolsGetPayload<{
  include: { academicCredentials: true };
}>;

export type TSchoolOutput = Prisma.SchoolsGetPayload<{}>;

export type TSchoolWithCoursesOutput = Prisma.SchoolsGetPayload<{
  include: {
    courses: { include: { course: { include: { curriculum: { select: { name: true; curriculumId: true } } } } } };
  };
}>;

export type TSchoolWithAllOutput = Prisma.SchoolsGetPayload<{
  include: {
    courses: { include: { course: true } };
    templates: { include: { certificates: true } };
    certificates: true;
  };
}>;

export type TSchoolCreateInput = Prisma.SchoolsCreateInput;
export type TSchoolUpdateInput = Prisma.SchoolsUpdateInput;
