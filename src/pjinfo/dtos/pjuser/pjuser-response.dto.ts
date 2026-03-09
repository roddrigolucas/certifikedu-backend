import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsString, ValidateNested } from 'class-validator';

class ResponseSchoolOnProfilePjInfoDto {
  @IsString()
  schoolId: string;

  @IsString()
  schoolName: string;

  @IsNumber()
  emmitedCertificatesQty: number;

  @IsNumber()
  createdCertificatesQty: number;

  @IsNumber()
  studentsQty: number;

  @IsNumber()
  tempStudentsQty: number;

  @IsNumber()
  coursesQty: number;
}

export class ResponseProfilePjInfoDto {
  @IsNumber()
  emmitedCertificatesQty: number;

  @IsNumber()
  createdCertificatesQty: number;

  @IsNumber()
  studentsQty: number;

  @IsNumber()
  tempStudentsQty: number;

  @IsNumber()
  coursesQty: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseSchoolOnProfilePjInfoDto)
  schools: Array<ResponseSchoolOnProfilePjInfoDto>;
}

class ResponseAddressPjInfoDto {
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

class ResponsePartnerPjInfoDto {
  @IsString()
  cpf: string;

  @IsString()
  phone: string;

  @IsString()
  name: string;

  @IsDate()
  birthdate: Date;

  @ValidateNested()
  @Type(() => ResponseAddressPjInfoDto)
  address: ResponseAddressPjInfoDto;
}

export class ResponsePjInfoDto {
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
  @Type(() => ResponsePartnerPjInfoDto)
  @IsArray()
  partners: Array<ResponsePartnerPjInfoDto>;
}
