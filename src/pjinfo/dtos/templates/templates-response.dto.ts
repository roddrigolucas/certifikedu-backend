import { QRCodePositionEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ResponseAbilityDto } from 'src/abilities/dtos/abilities-response.dto';
import { ResponseCourseTemplatePjInfoDto } from '../courses/courses-response.dto';

export class AllowedDocumentsTemplatePjInfoResponse {
  @IsArray()
  @IsString({ each: true })
  documents: Array<string>;
}

export class ResponseTemplateDataPjInfoDto {
  @IsNotEmpty()
  @IsString()
  templateId: string;

  @IsNotEmpty()
  @IsString()
  schoolId: string;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;

  @IsString()
  schoolName?: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  hoursWorkload: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseAbilityDto)
  abilities: ResponseAbilityDto[];

  @IsString()
  logoImage?: string;

  @IsString()
  backgroundId: string;

  @IsNotEmpty()
  @IsDate()
  issuedAt: Date;

  @IsNotEmpty()
  @IsDate()
  expiresAt: Date;

  @IsString()
  @IsNotEmpty()
  imageTemplateUrl: string;

  @IsNumber()
  @IsOptional()
  emissionQty?: number;

  @IsArray()
  @IsOptional()
  courses?: Array<ResponseCourseTemplatePjInfoDto>;

  @IsInt()
  @IsOptional()
  issuesNumberLimit?: number;

  @IsDate()
  @IsOptional()
  startDateTime?: Date;

  @IsDate()
  @IsOptional()
  expirationDateTime?: Date;

  @IsString()
  @IsOptional()
  descriptionImage?: string;

  @IsEnum(QRCodePositionEnum)
  qrCodePosition: QRCodePositionEnum;

  @IsArray()
  @IsString({ each: true })
  allowedDocuments: Array<string>;

  @IsBoolean()
  hidden: boolean;

  @IsString()
  @IsOptional()
  descriptionFontUrl?: string

  @IsString()
  @IsOptional()
  nameFontUrl?: string
}

export class ResponseTemplatesPjInfoDto {
  @ValidateNested()
  @Type(() => ResponseTemplateDataPjInfoDto)
  @IsArray()
  templates: Array<ResponseTemplateDataPjInfoDto>;
}

export class ResponseTemplateDataPjBasicDto {
  @IsString()
  templateId: string;
  
  @IsString()
  name: string;
}

export class ResponseTemplatesPjBasicDto {
  @ValidateNested()
  @Type(() => ResponseTemplateDataPjBasicDto)
  @IsArray()
  templates: Array<ResponseTemplateDataPjBasicDto>;
}

export class ResponseImagePreviewPjInfoDto {
  @IsString()
  previewUrl: string
}
