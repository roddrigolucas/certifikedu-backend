import { QRCodePositionEnum } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

class CourseInfoDto {
  @IsString()
  courseId: string;

  @IsString()
  courseName: string;
}

export class ResponseCanvasAbilitiesOnCertificateDto {
  @IsString()
  abilityId: string;

  @IsString()
  ability: string;

  @IsString()
  category: string;
}

export class ResponseCanvasPlatformEmmitedBulkCertificatesDto {
  @IsArray()
  notFound: Array<string>;

  @IsArray()
  emmitedCertificates: Array<string>;
}


export class ResponseCanvasPlatformTemplatesInfoDto {
  @IsNotEmpty()
  @IsString()
  templateId: string;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsString()
  schoolName: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  hoursWorkload: number;

  @IsNotEmpty()
  @IsArray()
  categories: Array<string>;

  @IsString()
  @IsNotEmpty()
  imageTemplateUrl: string;
}


export class ResponseCanvasPlatformTemplateDto {
  @IsNotEmpty()
  @IsString()
  templateId: string;

  @IsNotEmpty()
  @IsString()
  schoolId: string;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

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
  @Type(() => ResponseCanvasAbilitiesOnCertificateDto)
  abilities: ResponseCanvasAbilitiesOnCertificateDto[];

  @IsString()
  logoImage?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;

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
  courses?: Array<CourseInfoDto>;

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
}

export class ResponseCanvasPlatformTemplatesDto {
  @ValidateNested({ each: true })
  @Type(() => ResponseCanvasPlatformTemplatesInfoDto)
  templates: Array<ResponseCanvasPlatformTemplatesInfoDto>;
}
