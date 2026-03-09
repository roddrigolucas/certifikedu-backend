import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

class ResponseCanvasPlatformStudentInfoDto {
  @IsString()
  userId: string;

  @IsString()
  email: string;

  @IsString()
  document: string;

  @IsBoolean()
  isTemp: boolean;

  @IsString()
  @IsOptional()
  name?: string;
}

export class ResponseCanvasPlatformStudentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseCanvasPlatformStudentInfoDto)
  students: Array<ResponseCanvasPlatformStudentInfoDto>;
}
