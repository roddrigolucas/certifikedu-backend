import { SubjectTypeEnum } from '@prisma/client';
import { IsArray, IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class ResponseSubjectPjInfoDto {
  @IsString()
  subjectId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  totalHoursWorkload: number;

  @IsNumber()
  praticalHoursWorkload: number;

  @IsNumber()
  teoricHoursWorkload: number;

  @IsNumber()
  eadHoursWorkload: number;

  @IsNumber()
  @IsOptional()
  complementaryHoursWorkload?: number;

  @IsEnum(SubjectTypeEnum)
  type: SubjectTypeEnum;

  @IsArray()
  @IsOptional()
  semesters?: string[];

  @IsString()
  @IsOptional()
  studyField?: string;
}
