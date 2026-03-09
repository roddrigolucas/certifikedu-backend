import { CertificateStatus, PJAdminRoleEnum, PJAssociationStatus, UserStatus, UserType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsEmail, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { EnvironmentEnum } from "src/pjusers/dtos/pjusers-input.dto";
import { ResponsePjAssociateAdminInfoDto } from "src/pjusers/dtos/pjusers-response.dto";

class DocumentStatusDto {
  @IsString()
  pictureStatus: string;
}

class DocumentDataDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentStatusDto)
  data: DocumentStatusDto;
}

export class ResponsePfDocumentDto {
  @IsString()
  status: string;

  @ValidateNested()
  @Type(() => DocumentDataDto)
  response: DocumentDataDto;
}

class IsRawUserDto {
  @IsBoolean()
  isRaw: boolean;
}

class RawUserInfoDto {
  @ValidateNested()
  @Type(() => IsRawUserDto)
  userInfo: IsRawUserDto;
}

class RawUserDataDto {
  @ValidateNested()
  @Type(() => RawUserInfoDto)
  data: RawUserInfoDto
}

export class ResponseRawUserInfoDto {
  @ValidateNested()
  @Type(() => RawUserDataDto)
  response: RawUserDataDto;
}

class NaturalPersonDto {
  @IsString()
  id: string;

  @IsString()
  createdAt: Date;

  @IsString()
  updatedAt: Date;

  @IsString()
  userId: string;

  @IsString()
  cpf: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  birthDate: Date;

  @IsString()
  zipCode: string;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsString()
  neighborhood: string;

  @IsString()
  street: string;

  @IsString()
  number: string;

  @IsOptional()
  @IsString()
  additionalDetails: string;
}

class CorporateAndInstitutionalPjDto {
  @IsString()
  name: string;

  @IsString()
  pjId: string;

  @IsEnum(PJAssociationStatus)
  statusAssociation: PJAssociationStatus;

  @IsEnum(PJAdminRoleEnum)
  role: PJAdminRoleEnum;

  @IsEnum(EnvironmentEnum)
  environment: EnvironmentEnum;

}

class UserInfoDto {
  @IsString()
  id: string;

  @IsString()
  email: string;

  @IsString()
  document: string;

  @IsEnum(UserType)
  type: UserType;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsString()
  apiEnabled: boolean;

  @IsEnum(CertificateStatus)
  pictureStatus: CertificateStatus;

  @IsString()
  createdAt: Date;

  @IsString()
  updatedAt: Date;

  @IsNumber()
  receivedCertificateQty: number;

  @IsNumber()
  emmitedCertificateQty: number;

  @IsString()
  planId: string;

  @IsDate()
  nextPayment: Date;

  @IsString()
  paymentCardId: string;

  @IsBoolean()
  isRaw: boolean;

  @ValidateNested()
  @Type(() => CorporateAndInstitutionalPjDto)
  pjs: Array<CorporateAndInstitutionalPjDto>;

  @IsBoolean()
  hasProfessionalProfile: boolean;

  @IsBoolean()
  hasResumes: boolean;
}

class UserDataDto {
  @ValidateNested()
  @Type(() => NaturalPersonDto)
  naturalPerson: NaturalPersonDto;
}

class UserCreditsDto {
  @IsString()
  plan: string;

  @IsString()
  customerId: string;

  @IsString()
  certificateCredits: number;

  @IsString()
  additionalCertificateCredits: number;

  @IsString()
  monthSpentCredits: number;

  @IsDate()
  nextCertificateDate: Date;

  @IsString()
  subscriptionId: string;
}

class userCardsDto {
  @IsString()
  id: string;

  @IsString()
  customerId: string;

  @IsString()
  cardId: string;

  @IsString()
  lastFourDigits: string;

  @IsString()
  expMonth: number;

  @IsString()
  expYear: number;

  @IsString()
  brand: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsBoolean()
  isDefault: boolean;
}

class UserStructureDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UserInfoDto)
  userInfo?: UserInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDataDto)
  userData?: UserDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserCreditsDto)
  userCredits?: UserCreditsDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => userCardsDto)
  userCards?: userCardsDto[];
}

class CreatedPfUserResponse {
  @IsOptional()
  @ValidateNested()
  @Type(() => UserStructureDto)
  data: UserStructureDto;
}

export class ResponsePfInfoDto {
  @IsString()
  status: string;

  @ValidateNested()
  @Type(() => CreatedPfUserResponse)
  response: CreatedPfUserResponse;
}

class ResponseKeyInfoDto {
  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  apiKey: string;
}

class PJInfoDto {
  @IsString()
  userId: string;

  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsString()
  status: string;

  @IsBoolean()
  apiEnabled: boolean;

  @IsBoolean()
  ltiEnabled: boolean;

  @IsBoolean()
  canvasConfigured: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ResponseKeyInfoDto)
  apiKey?: ResponseKeyInfoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsePjAssociateAdminInfoDto)
  admins: Array<ResponsePjAssociateAdminInfoDto>;
}

class PJNaturalPersonDto {
  @IsString()
  name: string;
}

class PJUserDataDto {
  @ValidateNested()
  @Type(() => PJNaturalPersonDto)
  naturalPerson: PJNaturalPersonDto;
}

class PJUserStructureDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PJInfoDto)
  userInfo?: PJInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PJUserDataDto)
  userData?: PJUserDataDto;
}

class PJCreatedCreditResponse {
  @IsOptional()
  @ValidateNested()
  @Type(() => PJUserStructureDto)
  data: PJUserStructureDto;
}

export class ResponsePJUserInfoDto {
  @IsString()
  status: string;

  @ValidateNested()
  @Type(() => PJCreatedCreditResponse)
  response: PJCreatedCreditResponse;
}

export class ResponseRawUserDataDto {
  @IsString()
  documentNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  fromCanvas?: boolean;
}
