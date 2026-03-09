import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateActivityAPIDto } from '../activities/activities-input.dto';
import { CreateInternshipAPIDto } from '../internships/internships-input.dto';
import { CreateSemesterAPIDto } from '../semesters/semesters-input.dto';

export class CreateCurriculumAPIDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  requiredHoursWorkload: number;

  @IsNumber()
  electiveHoursWorkload: number;

  @IsNumber()
  complementaryHoursWorkload: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityAPIDto)
  activities?: Array<CreateActivityAPIDto>;

  @ValidateNested({ each: true })
  @Type(() => CreateInternshipAPIDto)
  internships?: Array<CreateInternshipAPIDto>;

  @ValidateNested({ each: true })
  @Type(() => CreateSemesterAPIDto)
  semesters?: Array<CreateSemesterAPIDto>;
}

export class EditCurriculumAPIDto {
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

export class AddCurriculumAPIDto {
  @IsArray()
  ids: Array<string>;
}
