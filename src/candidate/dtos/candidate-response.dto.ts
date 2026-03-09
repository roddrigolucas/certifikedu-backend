import {
  JobOpportunityStatus,
  JobOpportunityType,
  ProfessionalEducationLevel,
  SeniorityLevel,
  WorkModel,
} from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ResponseAbilityDto } from 'src/abilities/dtos/abilities-response.dto';

export class ResponseCandidateProfessionalProfileDto {
  @IsString()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  description: string;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsNumber()
  yearsOfExpirience: number;

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
  openToWork: boolean;

  @IsArray()
  workFields: Array<string>;

  @IsBoolean()
  isPcd: boolean;

  @ValidateNested({ each: true })
  @Type(() => ResponseAbilityDto)
  abilities: Array<ResponseAbilityDto>;
}

export class CandidateOpportunitiesDto {
  @IsEnum(JobOpportunityStatus)
  status: JobOpportunityStatus;

  @IsString()
  title: string;

  @IsEnum(WorkModel)
  workModel: WorkModel;

  @IsEnum(JobOpportunityType)
  jobOpportunityType: JobOpportunityType;
}

export class ResponseCandidateOpportunitiesDto {
  @ValidateNested()
  @Type(() => CandidateOpportunitiesDto)
  opportunities: Array<CandidateOpportunitiesDto>;
}
