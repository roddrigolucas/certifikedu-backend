import { PJAdminRoleEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum EnvironmentEnum {
  corporate = 'corporate',
  institutional = 'institutional',
}

export class AddressPjInfoDto {
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

export class PartnerPjInfoDto {
  @IsString()
  cpf: string;

  @IsString()
  phone: string;

  @IsString()
  name: string;

  @IsDate()
  birthdate: Date;

  @ValidateNested()
  @Type(() => AddressPjInfoDto)
  address: AddressPjInfoDto;
}

export class EditPartnerPjInfoDto {
  @IsNumber()
  socioId: number;

  @IsString()
  phone: string;

  @IsString()
  name: string;

  @IsDate()
  birthdate: string;

  @ValidateNested()
  @Type(() => AddressPjInfoDto)
  address: AddressPjInfoDto;
}

export class EditPJInfoDto {
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

  @ValidateNested()
  @Type(() => EditPartnerPjInfoDto)
  partner: EditPartnerPjInfoDto;
}

export class AssociatePJAdminDto {
  @IsString()
  cpf: string;

  @IsEnum(PJAdminRoleEnum)
  role: PJAdminRoleEnum;

  @IsEnum(EnvironmentEnum)
  environment: EnvironmentEnum;
}

export class PfUserDto {
  @IsString()
  name: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  DOB: string;

  @IsString()
  cepNumber: string;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsString()
  region: string;

  @IsString()
  street: string;

  @IsString()
  houseNumber: string;

  @IsString()
  @IsOptional()
  complement: string;
}

export class CreatePJAdminDto {
  @IsString()
  documentNumber: string;

  @IsEmail()
  email: string;

  @IsEnum(PJAdminRoleEnum)
  role: PJAdminRoleEnum;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PfUserDto)
  pfInfo: PfUserDto;

  @IsEnum(EnvironmentEnum)
  environment: EnvironmentEnum;
}

export class EditOrDeletePJAdminInfoDto {
  @IsString()
  adminId: string;

  @IsEnum(PJAdminRoleEnum)
  role: PJAdminRoleEnum;

  @IsEnum(EnvironmentEnum)
  environment: EnvironmentEnum;
}

export class EditOrDeletePJAdminDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EditOrDeletePJAdminInfoDto)
  admins: Array<EditOrDeletePJAdminInfoDto>;
}
