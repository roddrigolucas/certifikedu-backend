import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ResponseSubjectAPIDto } from '../subjects/subjects-response.dto';

export class ResponseSemesterAPIDto {
  @IsString()
  semesterId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsNumber()
  semesterNumber: number;

  @IsNumber()
  requiredHoursWorkload: number;

  @IsNumber()
  electiveHoursWorkload: number;

  @IsNumber()
  complementaryHoursWorkload: number;

  @ValidateNested()
  @Type(() => ResponseSubjectAPIDto)
  subjects: Array<ResponseSubjectAPIDto>;
}

