import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class ResponseAuthDto {
  @IsBoolean()
  success: boolean;
}

export class ResponseUsersRawInfoDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  documentNumber: string;

  @IsString()
  phone: string;

  @IsBoolean()
  isValid: boolean;

  @IsString()
  @IsOptional()
  error?: string;
}

export class ResponseRawUserDto {
  @IsArray()
  users: Array<ResponseUsersRawInfoDto>;
}
