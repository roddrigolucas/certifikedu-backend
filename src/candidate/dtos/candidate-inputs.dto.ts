import { JobOpportunityType, ProfessionalEducationLevel, SeniorityLevel, WorkModel } from '@prisma/client';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateOrUpdateCandidateProfessionalProfileDto {
  @IsString()
  description: string;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsNumber()
  yearsOfExperience: number;

  @IsArray()
  @IsEnum(SeniorityLevel, { each: true })
  seniorityLevel: Array<SeniorityLevel>;

  @IsArray()
  @IsEnum(ProfessionalEducationLevel, { each: true })
  educationLevel: Array<ProfessionalEducationLevel>;

  @IsArray()
  @IsEnum(WorkModel, { each: true })
  workModel: Array<WorkModel>;

  @IsArray()
  @IsEnum(JobOpportunityType, { each: true })
  opportunityType: Array<JobOpportunityType>;

  @IsBoolean()
  openToWork?: boolean;

  @IsArray()
  workFields: Array<string>;

  @IsBoolean()
  isPcd: boolean;
}
