import { EducationLevelEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ResponseTemplateDataPjInfoDto } from '../../templates/templates-response.dto';

class ResponseInstEventStudentInfoDto {
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

export class ResponseInstEventPjInfoDto {
  @IsString()
  institutionalEventId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsEnum(EducationLevelEnum)
  educationLevel: EducationLevelEnum;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ResponseInstEventStudentInfoDto)
  students: Array<ResponseInstEventStudentInfoDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => ResponseTemplateDataPjInfoDto)
  template?: ResponseTemplateDataPjInfoDto;
}

export class ResponseInstEventsPjInfoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseInstEventPjInfoDto)
  institutionalEvents: Array<ResponseInstEventPjInfoDto>;
}

class ResponseInstEventBasicPjInfoDto {
  @IsString()
  name: string;

  @IsString()
  institutionalEventId: string;
}

export class ResponseInstEventsBasicPjInfoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseInstEventBasicPjInfoDto)
  institutionalEvents: Array<ResponseInstEventBasicPjInfoDto>;
}
