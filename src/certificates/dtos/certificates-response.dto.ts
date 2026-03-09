import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ResponseEvidenceOnCertificateDto {
  @IsString()
  evidenceId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  evidenceType: string;

  @IsString()
  evidenceUrl: string;

  @IsString()
  @IsOptional()
  createdByUser?: string;

  @IsOptional()
  @IsString()
  certificateId?: string;
}

class ResponseNarrativeOnCertificateDto {
  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  @IsOptional()
  narrativeDescription?: string;

  @IsString()
  narrativeUrl: string;

  @IsString()
  narrativeType?: string;

  @IsOptional()
  @IsString()
  createdByUser?: string;

  @IsOptional()
  @IsString()
  certificateId?: string;
}

class ResponseAbilitiesOnCertificateDto {
  @IsString()
  @IsOptional()
  abilityId?: string;

  @IsString()
  ability: string;

  @IsString()
  category: string;
}

export class ResponseCertificateDto {
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
  @Type(() => ResponseAbilitiesOnCertificateDto)
  abilities: Array<ResponseAbilitiesOnCertificateDto>;

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

  @IsString()
  @IsOptional()
  statedIssuer?: string;

  @IsBoolean()
  statusRequest: boolean;

  @IsString()
  @IsOptional()
  certificateHash?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ResponseEvidenceOnCertificateDto)
  evidences?: Array<ResponseEvidenceOnCertificateDto>;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ResponseNarrativeOnCertificateDto)
  narrative?: Array<ResponseNarrativeOnCertificateDto>;
}

class ResponseUserLastCertificateDto {
  @IsString()
  @IsNotEmpty()
  certificateId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseAbilitiesOnCertificateDto)
  abilities: Array<ResponseAbilitiesOnCertificateDto>;

  @IsString()
  @IsNotEmpty()
  issuer: string;

  @IsString()
  @IsNotEmpty()
  createdAt: string;
}

export class ResponseUserLastCertificatesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseUserLastCertificateDto)
  certificates: Array<ResponseUserLastCertificateDto>;
}

class ResponseCertificateBasicInfoDto {
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
  @Type(() => ResponseAbilitiesOnCertificateDto)
  certificateAbilities: Array<ResponseAbilitiesOnCertificateDto>;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  certificateIssuer?: string;

  @IsString()
  @IsOptional()
  certificateReceptor?: string;

  @IsDate()
  @IsNotEmpty()
  certificateCreatedAt: Date;

  @IsString()
  @IsOptional()
  statedIssuer?: string;

  @IsString()
  status: string;

  @IsNumber()
  evidences: number;
}

class ResponseBasicCertificateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseCertificateBasicInfoDto)
  certificateInfo: ResponseCertificateBasicInfoDto[];

  @IsBoolean()
  hasNextPage: boolean;
}

export class ResponseSuccessCertificatesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ResponseBasicCertificateDto)
  data?: ResponseBasicCertificateDto;
}
