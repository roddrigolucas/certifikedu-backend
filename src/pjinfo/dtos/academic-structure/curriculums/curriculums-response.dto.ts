import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ResponseActivityPjInfoDto } from '../activities/activities-response.dto';
import { ResponseInternshipPjInfoDto } from '../internships/internships-response.dto';
import { ResponseSemesterPjInfoDto } from '../semesters/semesters-response.dto';

export class ResponseCurriculumPjInfoDto {
  @IsString()
  curriculumId: string;

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
  @Type(() => ResponseActivityPjInfoDto)
  activities?: Array<ResponseActivityPjInfoDto>;

  @ValidateNested({ each: true })
  @Type(() => ResponseInternshipPjInfoDto)
  internships?: Array<ResponseInternshipPjInfoDto>;

  @ValidateNested({ each: true })
  @Type(() => ResponseSemesterPjInfoDto)
  semesters?: Array<ResponseSemesterPjInfoDto>;
}
