import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { ResponseAcademicCredentialsAPIDto } from "../academic-credentias/academic-credentials-response.dto";

export class ResponseSchoolAPIDto {
  @IsNotEmpty()
  @IsString()
  schoolId: string;

  @IsNotEmpty()
  @IsString()
  schoolCnpj: string;

  @IsNotEmpty()
  createdAt: Date;

  @IsNotEmpty()
  updatedAt: Date;

  @IsNotEmpty()
  @IsString()
  homepageUrl: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => ResponseAcademicCredentialsAPIDto)
  credentials?: ResponseAcademicCredentialsAPIDto;
}

