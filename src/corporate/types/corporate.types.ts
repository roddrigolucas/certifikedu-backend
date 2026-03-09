import { Prisma } from '@prisma/client';

export type TJobOpportunityCreateInput = Prisma.JobOpportunityCreateInput;
export type TJobOpportunityUpdateInput = Prisma.JobOpportunityUpdateInput;

export type TPessoaFisicaOnJobOpportunityCreateManyInput = Prisma.PessoaFisicaOnJobOpportunityCreateManyInput;

export type TWorkFieldCreateInput = Prisma.WorkFieldsCreateInput;
export type TJobOpportunityWithCandidatesOutput = Prisma.JobOpportunityGetPayload<{
  include: { 
    recommendedCandidates: true 
  };
}>;

export type TJobOpportunityWithaAbilitiesAndWorkFieldsOutput = Prisma.JobOpportunityGetPayload<{
  include: {
    abilities: { include: { ability: true } };
    workFields: { include: { workField: true } };
  };
}>;

export type TJobOpportunityAbilitiesWorkFieldsCandidatesOutput = Prisma.JobOpportunityGetPayload<{
  include: {
    abilities: { include: { ability: true } };
    workFields: { include: { workField: true } };
    recommendedCandidates: { include: { pf: true } };
  };
}>;
