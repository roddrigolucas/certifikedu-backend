import { EducationLevelEnum } from '@prisma/client';
import { IsArray, IsBoolean, IsEnum, IsString } from 'class-validator';

export class CreateOrUpdateCoursePjInfoDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(EducationLevelEnum)
  level: EducationLevelEnum;

  @IsBoolean()
  isAcademic: boolean;
}

export class CreateCourseStudentsAssociationPjInfoDto {
  @IsArray()
  cpfs: Array<string>;
}
