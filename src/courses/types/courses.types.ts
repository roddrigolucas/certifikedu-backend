import { Prisma } from '@prisma/client';

export type TCourseCreateInput = Prisma.CourseCreateInput;
export type TCourseUpdateInput = Prisma.CourseUpdateInput;
export type TCourseWhereInput = Prisma.CourseWhereInput;
export type TCourseCreateManyInput = Prisma.CourseCreateManyInput;

export type TCourseOutput = Prisma.CourseGetPayload<{}>;

export type TCourseWithSchoolsOutput = Prisma.CourseGetPayload<{
  include: { schools: { include: { school: true } }; curriculum: { select: { curriculumId: true; name: true } } };
}>;

export type TCourseWithCredentialsOutput = Prisma.CourseGetPayload<{
  include: {
    schools: true;
    academicCredentials: true;
    templates: { include: { template: { include: { habilidades: { include: { habilidade: true } } } } } };
    curriculum: {select: {curriculumId: true, name: true}}
  };
}>;

export type TCourseWithSchoolAndStudentsOutput = Prisma.CourseGetPayload<{
  include: {
    schools: { include: { school: true } };
    students: { include: { student: { include: { user: true } } } };
  };
}>;

export type TCourseWithTemplatesOutput = Prisma.CourseGetPayload<{
  include: {
    schools: { include: { school: true } };
    templates: {
      include: {
        template: {
          include: {
            school: true;
            habilidades: { include: { habilidade: true } };
            TemplatesAllowedDocuments: true;
            fontVariantName: true;
            fontVariantDescription: true;
          };
        };
      };
    };
  };
}>;
