import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class ResponseCanvasAbilitiesOnCertificateDto {
  @IsString()
  abilityId: string;

  @IsString()
  ability: string;

  @IsString()
  category: string;
}

class ResponseCanvasPlatformEmmitedCertificatesInfoDto {
  @IsString()
  @IsNotEmpty()
  certificateId: string;

  @IsString()
  @IsNotEmpty()
  certificateName: string;

  @IsString()
  @IsNotEmpty()
  certificateDescription: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseCanvasAbilitiesOnCertificateDto)
  certificateAbilities: Array<ResponseCanvasAbilitiesOnCertificateDto>;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  certificateIssuer?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  certificateReceptor?: string;

  @IsDate()
  @IsNotEmpty()
  certificateCreatedAt: Date;

  @IsString()
  status: string;
}

class ResponseCanvasPlatformEmmitedCertificatesDto {
  @ValidateNested({ each: true })
  @Type(() => ResponseCanvasPlatformEmmitedCertificatesInfoDto)
  certificateInfo: Array<ResponseCanvasPlatformEmmitedCertificatesInfoDto>;
}
// TODO: Remover e padronizar
export class ResponseCanvasPlatformAdaptedCertificatesInfoDto {
  data: ResponseCanvasPlatformEmmitedCertificatesDto;
}

export class ResponseCanvasCertificatesDto {
  @IsString()
  @IsNotEmpty()
  certificateId: string;

  @IsString()
  @IsNotEmpty()
  receptorDoc: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  hoursWorkload: number;

  @IsString()
  receptorName: string;

  @IsString()
  issuerName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseCanvasAbilitiesOnCertificateDto)
  abilities: ResponseCanvasAbilitiesOnCertificateDto[];

  @IsBoolean()
  blockchain: boolean;

  @IsBoolean()
  openBadge: boolean;

  @IsDate()
  issuedAt: Date;

  @IsDate()
  expiresAt: Date;

  @IsString()
  status: string;

  @IsBoolean()
  statusRequest: boolean;

  @IsString()
  @IsOptional()
  certificateHash?: string;
}
