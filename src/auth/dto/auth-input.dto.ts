import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateNested } from 'class-validator';

export class PfUserDto {
  @IsString()
  @Length(3)
  nome: string;

  @IsString()
  telefone: string;

  @IsString()
  dataDeNascimento: string;

  @IsString()
  cepNumber: string;

  @IsString()
  estado: string;

  @IsString()
  cidade: string;

  @IsString()
  bairro: string;

  @IsString()
  rua: string;

  @IsString()
  numero: string;

  @IsString()
  @IsOptional()
  complemento: string;
}

export class AuthPfDto {
  @IsString()
  documentNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PfUserDto)
  pfInfo: PfUserDto;
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

export class SociosDto {
  @IsString()
  CPF: string;

  @IsString()
  nome: string;

  @IsString()
  telefone: string;

  @IsString()
  dataDeNascimento: string;

  @IsString()
  cepNumber: string;

  @IsString()
  estado: string;

  @IsString()
  cidade: string;

  @IsString()
  bairro: string;

  @IsString()
  rua: string;

  @IsString()
  numero: string;

  @IsString()
  @IsOptional()
  complemento: string;
}

export class PjUserDto {
  @IsString()
  razaoSocial: string;

  @IsString()
  nomeFantasia: string;

  @IsString()
  dataDeFundacao: string;

  @IsString()
  telefone: string;

  @IsString()
  @IsOptional()
  segmento: string;

  @IsNumber()
  @IsOptional()
  numeroDeFuncionarios: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SociosDto)
  socios: SociosDto;
}

export class AuthPjDto {
  @IsString()
  documentNumber: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PjUserDto)
  pjInfo: PjUserDto;
}

export class AuthenticateRequestDto {
  @IsString()
  email: string;

  @IsNotEmpty()
  password: string;
}


export class ResetUserPasswordDto {
  @IsEmail()
  email: string;
}
