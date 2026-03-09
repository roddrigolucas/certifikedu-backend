import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateTemplatedCertificatesPjInfoDto {
  @IsArray()
  cpfs: Array<string>;
}

export class CreateCertificatesPjInfoDto {
  @IsArray()
  @IsNotEmpty()
  receptorsDocs: Array<string>;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  hoursWorkload: number;

  @IsArray()
  abilitiesIds: string[];

  @IsString()
  @IsOptional()
  issuedAt?: string;

  @IsString()
  @IsOptional()
  expiresAt?: string;

  @IsString()
  schoolId: string;
}

export class CertificatesPagQueryPjInfoDto {
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

export class CertificateEmissionListDto {
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
