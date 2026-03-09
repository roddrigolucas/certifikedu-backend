import { SubjectTypeEnum } from '@prisma/client';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSubjectPjInfoDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  totalHoursWorkload: number;

  @IsNumber()
  @IsOptional()
  praticalHoursWorkload?: number;

  @IsNumber()
  @IsOptional()
  teoricHoursWorkload?: number;

  @IsNumber()
  @IsOptional()
  eadHoursWorkload?: number;

  @IsNumber()
  @IsOptional()
  complementaryHoursWorkload?: number;

  @IsEnum(SubjectTypeEnum)
  type: SubjectTypeEnum;
}

export class EditSubjectPjInfoDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  totalHoursWorkload?: number;

  @IsNumber()
  @IsOptional()
  praticalHoursWorkload?: number;

  @IsNumber()
  @IsOptional()
  teoricHoursWorkload?: number;

  @IsNumber()
  @IsOptional()
  eadHoursWorkload?: number;

  @IsNumber()
  @IsOptional()
  complementaryHoursWorkload?: number;

  @IsEnum(SubjectTypeEnum)
  @IsOptional()
  type?: SubjectTypeEnum;
}

export class SubjectToSemesterPjInfoDto {
  @IsArray()
  semesters: string[];
}
