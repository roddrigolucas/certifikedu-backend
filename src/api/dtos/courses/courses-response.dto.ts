import { EducationLevelEnum } from "@prisma/client";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsEnum, IsString, ValidateNested } from "class-validator";
import { ResponseAcademicCredentialsAPIDto } from "../academic-credentias/academic-credentials-response.dto";
import { ResponseCurriculumAPIDto } from "../curriculums/curriculums-response.dto";
import { ResponseTemplateDataAPIDto } from "../templates/templates-response.dto";

export class ResponseCourseAPIDto {
  @IsString()
  courseId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsArray()
  @ArrayMinSize(1)
  schoolIds: string[];

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(EducationLevelEnum)
  educationLevel: EducationLevelEnum;

  @ValidateNested({ each: true })
  @Type(() => ResponseTemplateDataAPIDto)
  templates: ResponseTemplateDataAPIDto[];

  @ValidateNested()
  @Type(() => ResponseAcademicCredentialsAPIDto)
  credentials: ResponseAcademicCredentialsAPIDto;

  @ValidateNested({ each: true })
  @Type(() => ResponseCurriculumAPIDto)
  curriculums: ResponseCurriculumAPIDto[];
}
