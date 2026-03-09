import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ResponseSubjectPjInfoDto } from '../subjects/subjects-response.dto';

export class ResponseSemesterPjInfoDto {
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
  @Type(() => ResponseSubjectPjInfoDto)
  subjects: Array<ResponseSubjectPjInfoDto>;
}

