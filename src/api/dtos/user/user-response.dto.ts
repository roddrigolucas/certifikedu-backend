import { IsArray, IsEmail, IsString } from 'class-validator';

export class UserInfoAPIDto {
  @IsString()
  name: string;

  @IsString()
  documentNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  userId: string;

  @IsArray()
  associatedSchools: Array<string>;
}

