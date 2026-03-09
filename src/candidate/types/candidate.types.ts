import { Prisma } from '@prisma/client';

export type TProfessionalProfileWithFieldsAndAbilitiesOutput = Prisma.ProfessionalProfileGetPayload<{
  include: {
    usedAbilities: { include: { abilities: true } };
    workFields: { include: { workField: true } };
  };
}>;

export type TProfessionalProfileWithOnlyIdsOutput = Prisma.ProfessionalProfileGetPayload<{
  select: {
    idPF: true
  }
}>;

export type TPessoaFisicaWithProfileAndOpportunitiesOutput = Prisma.PessoaFisicaGetPayload<{
  include: {
    professionalProfile: true;
    jobOpportunities: { include: { jobOpportunity: true } };
  };
}>;

export type TProfessionalProfileCreateInput = Prisma.ProfessionalProfileCreateInput;
export type TProfessionalProfileUpdateInput = Prisma.ProfessionalProfileUpdateInput;
