import { Type } from "class-transformer";
import { IsArray, IsEmail, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";

class RawUserPjInfoDto {
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
}

export class AuthRawUserPjInfoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RawUserPjInfoDto)
  users: Array<RawUserPjInfoDto>;

  @IsString()
  school: string;

  @IsString()
  @IsOptional()
  courseId?: string;
}

export class PaginationQueryPjInfoDto {
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  page?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  schoolId?: string;
}

export class CreateOrDeleteStudentsAssociationPjInfoDto {
  @IsArray()
  cpfs: Array<string>;
}

export class StudentAddressPjInfoDto {
  @IsString()
  zipCode: string;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsString()
  neighborhood: string;

  @IsString()
  street: string;

  @IsString()
  streetNumber: string;

  @IsString()
  @IsOptional()
  complementary: string;
}

export class CreateStudentPjInfoDto {
  @IsString()
  schoolId: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  document: string;

  @IsString()
  phone: string;

  @IsString()
  dob: string;

  @ValidateNested()
  @Type(() => StudentAddressPjInfoDto)
  address: StudentAddressPjInfoDto;
}

export class UserImportsListDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  page?: number = 0;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 500;
}
