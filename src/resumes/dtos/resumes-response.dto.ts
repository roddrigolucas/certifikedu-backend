import { IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentType, WorkModel, ResumeLanguageLevel } from '@prisma/client';

export class CertificateDto {
  @IsString()
  certificateId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  hash?: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsOptional()
  @IsDate()
  createdAt: Date;
}

export class ResumeExperienceDto {
  @IsString()
  resumeExperienceId: string;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateDto)
  certificates: CertificateDto[];

  @IsString()
  rawPJId: string;

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
}

export class ResumeEducationDto {
  @IsString()
  resumeEducationId: string;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateDto)
  certificates: CertificateDto[];

  @IsString()
  rawPJId: string;

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
}

export class ResumeLanguageDto {
  @IsString()
  resumeLanguageId: string;

  @IsString()
  language: string;

  @IsEnum(ResumeLanguageLevel)
  level: ResumeLanguageLevel;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateDto)
  certificates: CertificateDto[];
}

export class ResumeResponseDto {
  @IsString()
  resumeId: string;

  @IsString()
  description: string;

  @IsString()
  title: string;

  @IsDate()
  createdAt: Date;

  @IsBoolean()
  hasPdf: boolean;

  @IsString()
  pdfPath: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeLanguageDto)
  languages: ResumeLanguageDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeExperienceDto)
  experiences: ResumeExperienceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeEducationDto)
  educations: ResumeEducationDto[];
}

export class ResumeExperienceSummaryDto {
  @IsString()
  resumeExperienceId: string;

  @IsString()
  title: string;

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
}

export class ResumeEducationSummaryDto {
  @IsString()
  resumeEducationId: string;

  @IsString()
  title: string;

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
}

export class ResumeListItemDto {
  @IsString()
  resumeId: string;

  @IsString()
  title: string;

  @IsDate()
  createdAt: Date;
}

export class ResumeListResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeListItemDto)
  resumes: ResumeListItemDto[];
}
