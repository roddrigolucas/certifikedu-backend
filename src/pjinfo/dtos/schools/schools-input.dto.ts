import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateOrUpdateCoursePjInfoDto } from '../courses/courses-input.dto';

export class CreateNewSchoolPjInfoDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  //TODO: CHANGE THIS TO phoneNumber
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  document: string;

  //TODO: CHANGE THIS TO homepageUrl;
  @IsNotEmpty()
  @IsString()
  website: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @ValidateNested({ each: true })
  @Type(() => CreateOrUpdateCoursePjInfoDto)
  courses: Array<CreateOrUpdateCoursePjInfoDto>;
}

export class UpdateSchoolPjInfoDto {
  @IsString()
  @IsOptional()
  website?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
