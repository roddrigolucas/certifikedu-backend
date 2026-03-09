import { QRCodePositionEnum } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrUpdateTemplatePjInfoDto {
  @IsNotEmpty()
  @IsString()
  schoolId: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsString()
  @MaxLength(600)
  descriptionImage?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  hoursWorkload: number;

  @IsNotEmpty()
  @IsString()
  imageTemplate: string;

  @IsOptional()
  @IsString()
  inverseId?: string;

  @IsNotEmpty()
  @IsArray()
  abilities: string[];

  @IsString()
  @IsOptional()
  issuedAt?: string;

  @IsString()
  @IsOptional()
  expiresAt?: string;

  @IsEnum(QRCodePositionEnum)
  qrCodePosition: QRCodePositionEnum;

  @IsString()
  @IsOptional()
  hexFontColor?: string;

  @IsString()
  @IsOptional()
  fontIdDesc?: string;

  @IsString()
  @IsOptional()
  fontIdName?: string;
}

export class UpdateTemplateQrCodePjInfoDto {
  @IsOptional()
  @IsInt()
  issuesNumberLimit?: number;

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  startDateTime?: Date;

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  expirationDateTime?: Date;
}

export class TemplateAllowedDocumentsPjInfoDto {
  @IsArray()
  documents: Array<string>;
}

export class TemplateImagePreviewPjInfoDto {
  @IsString()
  name: string;

  @IsString()
  qrCodePosition: QRCodePositionEnum;

  @IsNotEmpty()
  @IsString()
  imageTemplate: string;

  @IsString()
  descriptionImage: string;

  @IsString()
  @IsOptional()
  hexFontColor?: string;

  @IsString()
  @IsOptional()
  fontIdDesc?: string;

  @IsString()
  @IsOptional()
  fontIdName?: string;
}
