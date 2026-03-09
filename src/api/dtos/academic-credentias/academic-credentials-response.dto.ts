import { AcademicTypeEnum, CredentialTypeEnum } from "@prisma/client";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";

export class ResponseAcademicCredentialsAPIDto {
  @IsString()
  credentialId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  emecCode: string;

  @IsEnum(AcademicTypeEnum)
  type: AcademicTypeEnum;

  @IsNumber()
  number: number;

  @IsString()
  description: string;

  @IsDate()
  issuedAt: Date;

  @IsDate()
  publishedDate: Date;

  @IsString()
  publishingVehicle: string;

  @IsString()
  publishingSection: string;

  @IsString()
  publishingPage: string;

  @IsNumber()
  numberDOU: number;

  @IsEnum(CredentialTypeEnum)
  credentialType: CredentialTypeEnum;
}

