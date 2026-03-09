import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";


export class CreateOrUpdateTemplateAPIDto {
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
  @ArrayMinSize(1)
  abilities: string[];

  @IsString()
  @IsOptional()
  issuedAt?: string;

  @IsString()
  @IsOptional()
  expiresAt?: string;
}
