import { EducationLevelEnum } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateInstEventPjInfoDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(EducationLevelEnum)
  level: EducationLevelEnum;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  templateId?: string;
}

export class CreateInstEventStudentsAssociationPjInfoDto {
  @IsArray()
  cpfs: Array<string>;
}
