import { QRCodePositionEnum } from '@prisma/client';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CanvasPlatformCreateTemplateDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsString()
  @MaxLength(600)
  descriptionImage?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  hoursWorkload: string;

  @IsNotEmpty()
  @IsString()
  imageTemplate: string;

  @IsNotEmpty()
  @IsString()
  backgroundImageId: string;

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
}

export class EditCanvasPlatformCreateTemplateDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @MaxLength(600)
  @IsOptional()
  descriptionImage?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  hoursWorkload?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  imageTemplate?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  backgroundImageId?: string;

  @IsNotEmpty()
  @IsArray()
  @IsOptional()
  abilities?: string[];

  @IsString()
  @IsOptional()
  issuedAt?: string;

  @IsString()
  @IsOptional()
  expiresAt?: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsString()
  @IsOptional()
  schoolId?: string;

  @IsEnum(QRCodePositionEnum)
  qrCodePosition: QRCodePositionEnum;
}

export class EmmitCanvasPlatformCertificateDto {
  @IsArray()
  userIds: Array<string>;
}
