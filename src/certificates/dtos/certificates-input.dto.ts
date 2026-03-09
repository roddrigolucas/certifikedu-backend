import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @MaxLength(600)
  descriptionImage: string;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  cargaHoraria: number;

  @IsString()
  @IsOptional()
  issuedAt?: string;

  @IsString()
  @IsOptional()
  statedIssuer?: string;

  @IsString()
  @IsOptional()
  statedIssuerDocument?: string;

  @IsString()
  @IsOptional()
  statedIssuerUrl?: string;

  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  habilidades: string[];

  @IsString()
  @IsOptional()
  fontIdDesc?: string;

  @IsString()
  @IsOptional()
  fontIdName?: string;
}

export class CertificatesPaginationQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;
}

export class SQSLambdaRequestDto {
  @IsBoolean()
  signSuccess: boolean;

  @IsBoolean()
  openBadgeSuccess: boolean;

  @IsString()
  hash: string;

  @IsString()
  sqs_secret: string;
}
