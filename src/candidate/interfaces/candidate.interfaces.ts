// import { JobOpportunityType, ProfessionalEducationLevel, SeniorityLevel, WorkModel } from '@prisma/client';

export interface IProfessionalProfileLambda {
  mode: 'save_user';
  user_id: string;
  description: string;
  categories: Array<string>;
  // state: string;
  // firstName: string;
  // city: string;
  // yearsOfExpirience: number;
  // seniorityLevel: Array<SeniorityLevel>;
  // educationLevel: Array<ProfessionalEducationLevel>;
  // workModel: Array<WorkModel>;
  // opportunityType: Array<JobOpportunityType>;
  // openToWork: boolean;
  // abilities: Array<string>;
}

export interface IUpdateProfileAbilitiesLambda {
  userId: string;
  abilities: Array<{
    abilityId: string;
    ability: string;
  }>;
}
