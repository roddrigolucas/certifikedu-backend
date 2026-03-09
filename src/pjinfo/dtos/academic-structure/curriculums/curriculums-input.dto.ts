import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateActivityPjInfoDto } from '../activities/activities-input.dto';
import { CreateInternshipPjInfoDto } from '../internships/internships-input.dto';
import { CreateSemesterPjInfoDto } from '../semesters/semesters-input.dto';

export class CreateCurriculumPjInfoDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  requiredHoursWorkload: number;

  @IsNumber()
  @IsOptional()
  electiveHoursWorkload: number;

  @IsNumber()
  @IsOptional()
  complementaryHoursWorkload: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityPjInfoDto)
  activities?: Array<CreateActivityPjInfoDto>;

  @ValidateNested({ each: true })
  @Type(() => CreateInternshipPjInfoDto)
  internships?: Array<CreateInternshipPjInfoDto>;

  @ValidateNested({ each: true })
  @Type(() => CreateSemesterPjInfoDto)
  semesters?: Array<CreateSemesterPjInfoDto>;
}

export class EditCurriculumPjInfoDto {
  @IsString()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  requiredHoursWorkload?: number;

  @IsNumber()
  @IsOptional()
  electiveHoursWorkload?: number;

  @IsNumber()
  @IsOptional()
  complementaryHoursWorkload?: number;
}

export class AddCurriculumPjInfoDto {
  @IsArray()
  ids: Array<string>;
}
