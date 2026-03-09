import { EducationLevelEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { ResponseTemplateDataPjInfoDto } from '../templates/templates-response.dto';

export class ResponseCourseTemplatePjInfoDto {
  @IsString()
  courseId: string;

  @IsString()
  courseName: string;
}

export class ResponseCourseStudentsInfoDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  document: string;

  @IsBoolean()
  isTemporary: boolean;
}

class CurriculumInfoDto {
  curriculumId: string
  name: string
}

export class ResponseCoursePjInfoDto {
  @IsString()
  courseId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(EducationLevelEnum)
  educationLevel: EducationLevelEnum;

  @IsBoolean()
  isAcademic: boolean;
  
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => CurriculumInfoDto)
  curriculums: Array<CurriculumInfoDto>
}

export class ResponseCoursesPJPjInfoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseCoursePjInfoDto)
  courses: Array<ResponseCoursePjInfoDto>;
}

export class ResponseCourseStudentPjInfoDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  document: string;

  @IsBoolean()
  isTemporary: boolean;
}

export class ResponseCourseStudentsPjInfoDto {
  @IsArray()
  students: ResponseCourseStudentPjInfoDto[];
}

export class ResponseCourseTemplatesPJPjInfoDto {
  @ValidateNested()
  @Type(() => ResponseTemplateDataPjInfoDto)
  templates: Array<ResponseTemplateDataPjInfoDto>;
}
