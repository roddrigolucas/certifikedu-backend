import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ResponseActivityAPIDto } from '../activities/activities-response.dto';
import { ResponseInternshipAPIDto } from '../internships/internships-response.dto';
import { ResponseSemesterAPIDto } from '../semesters/semesters-response.dto';

export class ResponseCurriculumAPIDto {
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
  @Type(() => ResponseActivityAPIDto)
  activities?: Array<ResponseActivityAPIDto>;

  @ValidateNested({ each: true })
  @Type(() => ResponseInternshipAPIDto)
  internships?: Array<ResponseInternshipAPIDto>;

  @ValidateNested({ each: true })
  @Type(() => ResponseSemesterAPIDto)
  semesters?: Array<ResponseSemesterAPIDto>;
}
