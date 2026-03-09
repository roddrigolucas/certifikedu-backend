import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { CreateSubjectAPIDto } from '../subjects/subjects-input.dto';

export class CreateSemesterAPIDto {
  @IsNumber()
  semesterNumber: number;

  @IsNumber()
  requiredHoursWorkload: number;

  @IsNumber()
  electiveHoursWorkload: number;

  @IsNumber()
  complementaryHoursWorkload: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSubjectAPIDto)
  subjects?: Array<CreateSubjectAPIDto>;
}

export class EditSemesterAPIDto {
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

export class SubjectsToSemesterAPIDto {
  @IsArray()
  @ArrayMinSize(1)
  subjects: Array<string>;
}
