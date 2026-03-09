import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { CreateSubjectPjInfoDto } from '../subjects/subjects-input.dto';

export class CreateSemesterPjInfoDto {
  @IsNumber()
  semesterNumber: number;

  @IsNumber()
  requiredHoursWorkload: number;

  @IsNumber()
  @IsOptional()
  electiveHoursWorkload: number;

  @IsNumber()
  @IsOptional()
  complementaryHoursWorkload: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSubjectPjInfoDto)
  subjects?: Array<CreateSubjectPjInfoDto>;
}

export class EditSemesterPjInfoDto {
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

export class SubjectsToSemesterPjInfoDto {
  @IsArray()
  @ArrayMinSize(1)
  subjects: Array<string>;
}
