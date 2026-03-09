import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PfUserAPIDto {
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

export class CreateNewUserAPIDto {
  @IsString()
  documentNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  schoolCnpj: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PfUserAPIDto)
  pfInfo: PfUserAPIDto;
}

export class AddUserToSchoolAPIDto {
  @IsArray()
  @IsString({ each: true })
  documentNumbers: Array<string>;

  @IsString()
  schoolId: string;
}
