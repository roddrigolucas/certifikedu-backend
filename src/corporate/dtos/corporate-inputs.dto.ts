import {
  JobOpportunityStatus,
  JobOpportunityType,
  PCDInfo,
  ProfessionalEducationLevel,
  SeniorityLevel,
  WorkModel,
} from '@prisma/client';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateJobOpportunityDto {
  @IsOptional()
  @IsString()
  endAt?: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsEnum(WorkModel)
  workModel: WorkModel;

  @IsEnum(JobOpportunityType)
  type: JobOpportunityType;

  @IsEnum(JobOpportunityStatus)
  @IsOptional()
  status: JobOpportunityStatus;

  @IsArray()
  abilities: Array<string>;

  @IsArray()
  workFields: Array<string>;

  @IsNumber()
  @IsOptional()
  minimumExperienceLevel?: number;

  @IsNumber()
  @IsOptional()
  maximumExperienceLevel?: number;

  @IsNumber()
  @IsOptional()
  minimumSalaryRange?: number;

  @IsNumber()
  @IsOptional()
  maximumSalaryRange?: number;

  @IsArray()
  @IsEnum(SeniorityLevel, { each: true })
  seniorityLevel?: Array<SeniorityLevel>;

  @IsArray()
  @IsEnum(ProfessionalEducationLevel, { each: true })
  educationLevel?: Array<ProfessionalEducationLevel>;

  @IsEnum(PCDInfo)
  @IsOptional()
  pcdInfo: PCDInfo;
}
