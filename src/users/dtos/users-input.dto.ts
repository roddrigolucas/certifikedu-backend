import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateRawUserDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsDateString()
  birthdate: string;

  @IsString()
  zipCode: string;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsString()
  region: string;

  @IsString()
  street: string;

  @IsString()
  streetNumber: string;

  @IsString()
  complementary: string;
}

export class RawUserDto {
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

export class AuthRawUserDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RawUserDto)
  users: Array<RawUserDto>;

  @IsString()
  school: string;

  @IsString()
  @IsOptional()
  courseId?: string;
}

export class UpdatePfInfoDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  birthDate?: Date;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  additionalDetails?: string;
}
