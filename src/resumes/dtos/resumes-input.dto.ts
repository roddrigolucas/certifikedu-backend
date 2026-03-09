import { IsArray, IsInt, IsOptional, IsString, ValidateNested, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentType, WorkModel, ResumeLanguageLevel } from '@prisma/client';

export class CreateOrUpdateResumeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrUpdateResumeExperienceDto)
  experiences?: CreateOrUpdateResumeExperienceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrUpdateResumeEducationDto)
  educations?: CreateOrUpdateResumeEducationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrUpdateResumeLanguageDto)
  languages?: CreateOrUpdateResumeLanguageDto[];
}

export class CreateOrUpdateResumeExperienceDto {
  @IsOptional()
  @IsUUID()
  resumeExperienceId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  startYear: number;

  @IsInt()
  startMonth: number;

  @IsOptional()
  @IsInt()
  endYear?: number;

  @IsOptional()
  @IsInt()
  endMonth?: number;

  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @IsEnum(WorkModel)
  workModel: WorkModel;

  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  companyPhone?: string;

  @IsOptional()
  @IsString()
  companyCnpj?: string;

  @IsOptional()
  @IsString()
  companyLocation?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  certificates?: string[];
}

export class CreateOrUpdateResumeEducationDto {
  @IsOptional()
  @IsUUID()
  resumeEducationId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  startYear: number;

  @IsInt()
  startMonth: number;

  @IsOptional()
  @IsInt()
  endYear?: number;

  @IsOptional()
  @IsInt()
  endMonth?: number;

  @IsString()
  institutionName: string;

  @IsOptional()
  @IsString()
  institutionEmail?: string;

  @IsOptional()
  @IsString()
  institutionPhone?: string;

  @IsOptional()
  @IsString()
  institutionCnpj?: string;

  @IsOptional()
  @IsString()
  institutionLocation?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  certificates?: string[];
}

export class CreateOrUpdateResumeLanguageDto {
  @IsOptional()
  @IsUUID()
  resumeLanguageId?: string;

  @IsString()
  language: string;

  @IsEnum(ResumeLanguageLevel)
  level: ResumeLanguageLevel;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  certificates?: string[];
}
