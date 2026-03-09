import { Transform } from 'class-transformer';
import { IsArray, IsDate, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrUpdateTemplateDto {
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

  @IsNotEmpty()
  @IsString()
  hoursWorkload: string;

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

}

export class AbilityToTemplateDto {
  @IsNotEmpty()
  @IsArray()
  abilities: string[];
}

export class EditTemplateDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @IsOptional()
  hoursWorkload?: string;

  @IsArray()
  @IsOptional()
  abilities?: string[];

  @IsString()
  @IsOptional()
  issuedAt?: string;

  @IsString()
  @IsOptional()
  expiresAt?: string;
}

export class UpdateTemplateQrCodeDto {
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

export class StudentInfoDto {
  @IsString()
  templateId: string;

  @IsString()
  docNumber: string;

  @IsString()
  name: string;

  @IsString()
  email: string;
}
