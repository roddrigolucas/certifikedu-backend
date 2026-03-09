import { EducationLevelEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateAcademicCredentialsAPIDto } from '../academic-credentias/academic-credentials-input.dto';

export class CourseInfoAPIDto {
  @IsString()
  courseId: string;

  @IsString()
  courseName: string;
}


export class CreateCourseAPIDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(EducationLevelEnum)
  educationLevel: EducationLevelEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAcademicCredentialsAPIDto)
  credentials?: CreateAcademicCredentialsAPIDto;

  @IsOptional()
  @IsNumber()
  canvasCourseId?: number;
}

export class EditCourseAPIDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EducationLevelEnum)
  @IsOptional()
  educationLevel?: EducationLevelEnum;
}

