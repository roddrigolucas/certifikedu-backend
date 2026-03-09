import { PJAdminRoleEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsString, ValidateNested } from 'class-validator';
import { EnvironmentEnum } from './pjusers-input.dto';

export class ResponseDeletedPJAdminDto {
  @IsArray()
  deleted: Array<string>;

  @IsArray()
  notFound: Array<string>;
}

export class ResponsePjAdminRolesDto {
  @IsString()
  adminId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsEnum(PJAdminRoleEnum)
  role: PJAdminRoleEnum;

  @IsEnum(EnvironmentEnum)
  environment: EnvironmentEnum;
}

export class ResponsePjAssociateAdminInfoDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  document: string;

  @IsString()
  status: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsePjAdminRolesDto)
  pjAdmins: Array<ResponsePjAdminRolesDto>;
}

export class ResponsePJAdminDto {
  @ValidateNested({ each: true })
  @Type(() => ResponsePjAssociateAdminInfoDto)
  @IsArray()
  admins: Array<ResponsePjAssociateAdminInfoDto>;

  @IsArray()
  notFound: Array<string>;
}

export class ResponseCheckUserDto {
  @IsBoolean()
  isFound: boolean;

  @IsString()
  email: string;

  @IsString()
  cpf: string;

  @IsString()
  name: string;
}

export class ResponseAddressPjUsersDto {
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

export class ResponsePartnerPjUsersDto {
  @IsString()
  cpf: string;

  @IsString()
  phone: string;

  @IsString()
  name: string;

  @IsDate()
  birthdate: Date;

  @ValidateNested()
  @Type(() => ResponseAddressPjUsersDto)
  address: ResponseAddressPjUsersDto;
}

export class ResponseInfoPjUsersDto {
  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  companyName: string;

  @IsString()
  fantasyName: string;

  @IsString()
  cnpj: string;

  @IsDate()
  dateCreation: Date;

  @IsString()
  category: string;

  @ValidateNested()
  @Type(() => ResponsePartnerPjUsersDto)
  partner: ResponsePartnerPjUsersDto;
}
