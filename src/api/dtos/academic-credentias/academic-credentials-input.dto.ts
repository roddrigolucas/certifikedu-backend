import { AcademicTypeEnum, CredentialTypeEnum } from "@prisma/client";
import { IsEnum, IsNumber, IsString } from "class-validator";

export class CreateAcademicCredentialsAPIDto {
  @IsString()
  emecCode: string;

  @IsEnum(AcademicTypeEnum)
  type: AcademicTypeEnum;

  @IsNumber()
  number: number;

  @IsString()
  description: string;

  @IsString()
  issuedAt: string;

  @IsString()
  publishedDate: string;

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
