import { Type } from 'class-transformer';
import { IsArray, IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ResponseAbilitiesAPIDto } from '../abilities/abilities-response.dto';
import { CourseInfoAPIDto } from '../courses/courses-input.dto';

export class ResponseTemplateDataAPIDto {
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
  @Type(() => ResponseAbilitiesAPIDto)
  abilities: ResponseAbilitiesAPIDto[];

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
  courses?: Array<CourseInfoAPIDto>;

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
}

export class ResponseTemplatesAPIDto {
  @ValidateNested()
  @Type(() => ResponseTemplateDataAPIDto)
  @IsArray()
  templates: Array<ResponseTemplateDataAPIDto>;
}
