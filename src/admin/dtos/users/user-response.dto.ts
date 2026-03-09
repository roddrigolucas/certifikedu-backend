import { CertificateStatus, UserStatus, UserType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { ResponseAbilityDto } from "src/abilities/dtos/abilities-response.dto";

export class ResponseDocPicturesAdminDto  {
  @IsString()
  pictureId: string;

  @IsEnum(CertificateStatus)
  pictureStatus: CertificateStatus;
}

class ResponseUserAdminDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  document: string;

  @IsEnum(UserType)
  type: UserType; 

  @IsEnum(UserStatus)
  status: UserStatus; 

  @IsString()
  pictureId: string;

  @IsBoolean()
  freeCertificates: boolean;

  //TODO: CHANGE THIS TO AN ARRAY 
  //@IsArray()
  //@ValidateNested({each: true})
  //@Type(() => ResponseDocPicturesAdminDto)
  //documentPictures: Array<ResponseDocPicturesAdminDto>;
}

export class ResponseUsersAdminDto {
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ResponseUserAdminDto)
  users: Array<ResponseUserAdminDto>
}

export class ResponseAdminAddressDto {
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

export class ResponseAdminPartnerPjInfoDto {
  @IsNumber()
  socioId: number;

  @IsString()
  phone: string;

  @IsString()
  name: string;

  @IsDate()
  birthdate: Date;

  @ValidateNested()
  @Type(() => ResponseAdminAddressDto)
  address: ResponseAdminAddressDto;
}

export class ResponsePfUserInfoAdminDto {
  @IsString()
  name: string;

  @IsString()
  phoneNumber: string;

  @IsDate()
  birthdate: Date;

  @ValidateNested()
  @Type(() => ResponseAdminAddressDto)
  address: ResponseAdminAddressDto;
}

export class ResponsePjUserInfoAdminDto {
  @IsString()
  phone: string;

  @IsString()
  companyName: string;

  @IsString()
  fantasyName: string;

  @IsDate()
  dateCreation: Date;

  @IsString()
  category: string;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ResponseAdminPartnerPjInfoDto)
  partners: Array<ResponseAdminPartnerPjInfoDto>;
}

export class ResponseCertificateInfoAdminDto {
  @IsString()
  certificateId: string;

  @IsString()
  receptorDoc: string;

  @IsString()
  name: string;

  @IsDate()
  createdAt: Date;

  @IsString()
  description: string;

  @IsNumber()
  hoursWorkload: number;

  @IsString()
  receptorName: string;

  @IsString()
  issuerName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseAbilityDto)
  abilities: Array<ResponseAbilityDto>;

  @IsBoolean()
  blockchain: boolean;

  @IsBoolean()
  openBadge: boolean;

  @IsDate()
  issuedAt: Date;

  @IsDate()
  expiresAt: Date;

  @IsEnum(CertificateStatus)
  status: CertificateStatus;

  @IsBoolean()
  statusRequest: boolean;

  @IsString()
  certificateHash: string;
}


export class ResponseUserInfoAdminDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsEnum(UserType)
  type: UserType; 

  @IsEnum(UserStatus)
  status: UserStatus; 

  @IsBoolean()
  isRaw: boolean;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ResponseDocPicturesAdminDto)
  documentPictures: Array<ResponseDocPicturesAdminDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => ResponsePfUserInfoAdminDto)
  pf?: ResponsePfUserInfoAdminDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ResponsePjUserInfoAdminDto)
  pj?: ResponsePjUserInfoAdminDto;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ResponseCertificateInfoAdminDto)
  certificates: Array<ResponseCertificateInfoAdminDto>;
}

