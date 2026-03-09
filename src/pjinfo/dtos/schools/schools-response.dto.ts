import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

class ResponseSchoolInfoPjInfoDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  document: string;

  @IsString()
  website: string;

  @IsString()
  description: string;
}

class ResponseSchoolsDataPjInfoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseSchoolInfoPjInfoDto)
  data: Array<ResponseSchoolInfoPjInfoDto>;
}

class ResponseSchoolDataPjInfoDto {
  @ValidateNested({ each: true })
  @Type(() => ResponseSchoolInfoPjInfoDto)
  data: ResponseSchoolInfoPjInfoDto;
}

export class ResponseSchoolsPjInfoDto {
  @IsNumber()
  statusCode: number;

  @IsString()
  status: string;

  @ValidateNested()
  @Type(() => ResponseSchoolsDataPjInfoDto)
  response: ResponseSchoolsDataPjInfoDto;
}

export class ResponseSchoolPjInfoDto {
  @IsNumber()
  statusCode: number;

  @IsString()
  status: string;

  @ValidateNested()
  @Type(() => ResponseSchoolDataPjInfoDto)
  response: ResponseSchoolDataPjInfoDto;
}

class ResponseMessagePjInfoDto {
  @IsString()
  message: string;
}

export class ResponseCreateSchoolPjInfoDto {
  @IsNumber()
  statusCode: number;

  @IsString()
  status: string;

  @ValidateNested()
  @Type(() => ResponseMessagePjInfoDto)
  response: ResponseMessagePjInfoDto;
}

