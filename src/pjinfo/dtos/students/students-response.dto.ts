import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ResponseUserRawPjInfoDto {
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

export class ResponseRawUsersPjInfoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseUserRawPjInfoDto)
  users: Array<ResponseUserRawPjInfoDto>;
}

class SchoolDataPjInfoDto {
  @IsString()
  schoolId: string;

  @IsString()
  schoolName: string;
}

class CourseDataPjInfoDto {
  @IsString()
  courseId: string;

  @IsString()
  courseName: string;
}

class ResponseStudentPjInfoDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  document: string;

  @IsNumber()
  certificateQty: number;

  @IsBoolean()
  isTemp: boolean;

  @IsArray()
  schools: Array<SchoolDataPjInfoDto>;

  @IsArray()
  courses: Array<CourseDataPjInfoDto>;
}

class ResponseStudentsDataPjInfoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseStudentPjInfoDto)
  data: Array<ResponseStudentPjInfoDto>;

  @IsBoolean()
  hasNextPage: boolean;
}

export class ResponseStudentsPjInfoDto {
  @IsNumber()
  statusCode: number;

  @IsString()
  status: string;

  @ValidateNested()
  @Type(() => ResponseStudentsDataPjInfoDto)
  response: ResponseStudentsDataPjInfoDto;
}


class ResponseStudentBySchoolPjInfoDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  document: string;

  @IsBoolean()
  isTemporary: boolean;
}

export class ResponseStudentsBySchoolPjInfoDto {
  @IsArray()
  students: ResponseStudentBySchoolPjInfoDto[];
}

export class StudentsImportsDetailResponseDto {
  @IsString()
  importId: string;

  @IsArray()
  @ValidateNested({ each: true })
  students: StudentImportDetailInfo[];

  @IsString()
  schoolId: string;

  @IsString()
  schoolName: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsString()
  @IsOptional()
  courseName?: string;

  @IsInt()
  successQuantity: number;

  @IsInt()
  failedQuantity: number;

  @IsDate()
  createdAt: Date;
}

class StudentImportDetailInfo {
  @IsString()
  document: string;

  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsBoolean()
  errorOnImport: boolean;
}

export class StudentImportsListResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserImportsListInfo)
  data: UserImportsListInfo[];

  @IsBoolean()
  hasNextPage: boolean;
}

class UserImportsListInfo {
  @IsString()
  importId: string;

  @IsString()
  schoolId: string;

  @IsString()
  schoolName: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsString()
  @IsOptional()
  courseName?: string;

  @IsInt()
  successQuantity: number;

  @IsInt()
  failedQuantity: number;

  @IsDate()
  createdAt: Date;
}
