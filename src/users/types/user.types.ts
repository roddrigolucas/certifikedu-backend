import { Prisma } from '@prisma/client';

export type TUserOutput = Prisma.UserGetPayload<{}>;

export type TPessoaFisicaCreateInput = Prisma.PessoaFisicaCreateInput;
export type TPessoaFisicaUpdateInput = Prisma.PessoaFisicaUpdateInput;
export type TPessoaJuridicaUpdateInput = Prisma.PessoaJuridicaUpdateInput;

export type TUserPfAndPjOutput = Prisma.UserGetPayload<{
  include: { pessoaFisica: true; pessoaJuridica: true };
}>;

export type TUserPfAndPjAndPartnersOutput = Prisma.UserGetPayload<{
  include: { document: true; pessoaFisica: true; pessoaJuridica: { include: { socios: true } } };
}>;

export type TUserPfAndPjAndDocumentOutput = Prisma.UserGetPayload<{
  include: {
    document: true;
    pessoaFisica: true;
    pessoaJuridica: { select: { nomeFantasia: true } };
  };
}>;

export type TUserWithPfAndProfileOutput = Prisma.UserGetPayload<{
  include: {
    pessoaFisica: {
      include: { professionalProfile: { select: { id: true } }; resumes: { select: { resumeId: true } } };
    };
  };
}>;

export type TUserWithPjAndLtiAndKeysOutput = Prisma.UserGetPayload<{
  include: {
    pessoaJuridica: { include: { ltiConfiguration: true } };
    apiKey: { where: { isDeleted: false } };
  };
}>;

export type TUserPfWithBasicInfoOutput = Prisma.PessoaFisicaGetPayload<{
  select: { nome: true; CPF: true; email: true; telefone: true };
}>;

export type TUserPfOutput = Prisma.UserGetPayload<{
  include: { pessoaFisica: true };
}>;

export type TUserPfWithSchoolsOutput = Prisma.UserGetPayload<{
  include: { pessoaFisica: { include: { schools: true } } };
}>;

export type TUserPfWithCoursesOutput = Prisma.UserGetPayload<{
  include: { pessoaFisica: { include: { courses: true } } };
}>;

export type TUserPjOutput = Prisma.UserGetPayload<{
  include: { pessoaJuridica: true };
}>;

export type TDocumentPictureOutput = Prisma.DocumentsPicturesGetPayload<{}>;

export type TDocumentPictureCreateInput = Prisma.DocumentsPicturesCreateInput;

export type TUserOnSchoolsOutput = Prisma.UserGetPayload<{
  include: {
    pessoaFisica: {
      include: {
        courses: { include: { course: true } };
        schools: true;
      };
    };
  };
}>;

export type TUserOnCourseOutput = Prisma.UserGetPayload<{
  include: { pessoaFisica: true };
}>;

export type TUserImportOutput = Prisma.UserImportsGetPayload<{}>;
