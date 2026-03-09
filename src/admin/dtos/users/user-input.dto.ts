import { CertificateStatus, UserStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsDateString, IsEmail, IsEnum, IsString, ValidateNested } from "class-validator";

export class AdminAddressDto {
  @IsString()
  street: string;

  @IsString()
  streetNumber: string;

  @IsString()
  neighborhood: string;

  @IsString()
  zipCode: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  complementary: string;
}

export class AdminEditPartnerPjInfoDto {
  @IsString()
  phone: string;

  @IsString()
  name: string;

  @IsDate()
  birthdate: string;

  @ValidateNested()
  @Type(() => AdminAddressDto)
  address: AdminAddressDto;
}

export class AdminUpdatePjInfoDto {
  @IsString()
  phone: string;

  @IsString()
  companyName: string;

  @IsString()
  fantasyName: string;

  @IsString()
  dateCreation: string;

  @IsString()
  category: string;
}

export class AdminUpdatePfInfoDto {
  @IsString()
  name: string;

  @IsString()
  phoneNumber: string;

  @IsDateString()
  birthdate: string;

  @ValidateNested()
  @Type(() => AdminAddressDto)
  address: AdminAddressDto;
}

export class AdminUpdateUserEmailDto {
  @IsEmail()
  email?: string;
}

export class UpdateUserStatusAdminParamDto {
  @IsString()
  userId: string;

  @IsEnum(UserStatus)
  status: UserStatus;
}

export class UpdateUserDocumentPictureStatusAdminParamDto {
  @IsString()
  pictureId: string;

  @IsEnum(CertificateStatus)
  status: CertificateStatus;
}
