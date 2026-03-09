import { Prisma } from '@prisma/client';

export type TTemplateCreateInput = Prisma.TemplatesCreateInput;
export type TTemplateUpdateInput = Prisma.TemplatesUpdateInput;

export type TTemplateAllowedDocsCreateInput = Prisma.TemplatesAllowedDocumentsCreateManyInput;

export type TTemplateInfo = Prisma.TemplatesGetPayload<{
  include: {
    school: { include: { userId: true } };
    habilidades: { include: { habilidade: true } };
  };
}>;

export type TTemplateSchoolAbilitiesCourseData = Prisma.TemplatesGetPayload<{
  include: {
    school: { include: { userId: true } };
    habilidades: { include: { habilidade: true } };
    courses: { include: { course: true } };
  };
}>;

export type TTemplateBasicData = Prisma.TemplatesGetPayload<{
  select: {
    templateId: true;
    name: true;
    learningPaths: {
      select: {
        pathId: true
      }
    }
  };
}>;

export type TTemplateAbilitiesData = Prisma.TemplateAbilitiesGetPayload<{
  include: {
    habilidade: true;
  };
}>;

export type TTemplateSchoolAbilitiesOutput = Prisma.TemplatesGetPayload<{
  include: {
    school: { include: { userId: true } };
    habilidades: { include: { habilidade: true } };
  };
}>;
