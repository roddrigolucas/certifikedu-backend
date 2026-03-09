import {
  JobOpportunityStatus,
  JobOpportunityType,
  PCDInfo,
  ProfessionalEducationLevel,
  SeniorityLevel,
  WorkModel,
} from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ResponseAbilityDto } from 'src/abilities/dtos/abilities-response.dto';

class JobOpportunityInfoDto {
  @IsString()
  jobId: string;

  @IsEnum(JobOpportunityStatus)
  status: JobOpportunityStatus;

  @IsString()
  title: string;

  @IsEnum(WorkModel)
  workModel: WorkModel;

  @IsEnum(JobOpportunityType)
  jobOpportunityType: JobOpportunityType;

  @IsNumber()
  candidates: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  endAt: Date;

  @IsNumber()
  jobCode: number;

  @IsEnum(PCDInfo)
  pcdInfo: PCDInfo;
}

export class ResponseProfileCorporateDto {
  @IsNumber()
  inProgress: number;

  @IsNumber()
  closed: number;

  @ValidateNested()
  @Type(() => JobOpportunityInfoDto)
  jobOpportunities: Array<JobOpportunityInfoDto>;
}

class ResponseJobCandidatesDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  matchScore: number;

  @IsNumber()
  generalScore: number;

  @IsNumber()
  AbilitiesScore: number;
}

export class ResponseJobOpportunityDto {
  @IsEnum(JobOpportunityStatus)
  status: JobOpportunityStatus;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(WorkModel)
  workModel: WorkModel;

  @ValidateNested()
  @Type(() => ResponseAbilityDto)
  abilities: Array<ResponseAbilityDto>;

  @IsEnum(JobOpportunityType)
  jobOpportunityType: JobOpportunityType;

  @IsArray()
  workFields: Array<string>;

  @IsNumber()
  candidatesNumber: number;

  @IsDate()
  @IsOptional()
  endAt?: Date;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

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

  @ValidateNested({ each: true })
  @Type(() => ResponseJobCandidatesDto)
  candidates: Array<ResponseJobCandidatesDto>;

  @IsNumber()
  jobCode: number;

  @IsEnum(PCDInfo)
  pcdInfo: PCDInfo;
}


class ResponseJobCandidateCertificatesDto {
  @IsString()
  issuerName: string;

  @IsString()
  name: string;

  @IsNumber()
  hoursWorkload: number;

  @IsArray()
  categories: Array<string>;

  @IsString()
  certificateImage: string;

  @IsDate()
  issuedAt: Date;

  @IsDate()
  expiresAt: Date;

  @IsBoolean()
  isSelfEmmited: boolean;
}

export class ResponseJobCandidateInfoDto {
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
  yearsOfExperience: number;

  @IsBoolean()
  isPcd: boolean;

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

  @ValidateNested({ each: true })
  @Type(() => ResponseAbilityDto)
  abilities: Array<ResponseAbilityDto>;

  @ValidateNested({ each: true })
  @Type(() => ResponseJobCandidateCertificatesDto)
  certificates: Array<ResponseJobCandidateCertificatesDto>;
}
