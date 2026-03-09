// import { JobOpportunityType, ProfessionalEducationLevel, SeniorityLevel, WorkModel } from '@prisma/client';

interface IAbilityNewJob {
  abilityId: string;
  ability: string;
}

export interface INewJobLambda {
  mode: 'search';
  description: string;
  abilities: Array<IAbilityNewJob>;
  categories: Array<string>;
  // title: string;
  // state: string;
  // city: string;
  // workModel: WorkModel;
  // type: JobOpportunityType;
  // maximumExperienceLevel?: number;
  // minimumExperienceLevel?: number;
  // seniorityLevel: Array<SeniorityLevel>;
  // educationLevel: Array<ProfessionalEducationLevel>;
}

export interface IJobCandidateResponse {
  user_id: string;
  abilities_score: number;
  general_score: number;
}

export interface IJobCandidateResponseTreated {
  message: string;
  data: Array<IJobCandidateResponse>;
}
