import { IsArray, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class ResponseInternshipPjInfoDto {
  @IsString()
  internshipId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  hoursWorkload: number;

  @IsArray()
  @IsOptional()
  curriculums?: string[];

  @IsString()
  @IsOptional()
  studyField?: string;
}
