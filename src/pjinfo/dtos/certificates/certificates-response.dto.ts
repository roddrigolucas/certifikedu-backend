import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CertificateSuccessStatus } from '@prisma/client';

class ResponseAbilitiesPjInfoDto {
  @IsString()
  @IsOptional()
  abilityId?: string;

  @IsString()
  ability: string;

  @IsString()
  category: string;
}

export class ResponseCertificatesPjInfoDto {
  @IsNumber()
  created: number;

  @IsArray()
  notFound: Array<string>;
}

class ResponseEvidencePjInfoDto {
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

class ResponseNarrativePjInfoDto {
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

export class ResponseCertificatePjInfoDto {
  @IsString()
  @IsNotEmpty()
  certificateId: string;

  @IsString()
  @IsNotEmpty()
  receptorDoc: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  hoursWorkload: number;

  @IsString()
  receptorName: string;

  @IsString()
  issuerName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseAbilitiesPjInfoDto)
  abilities: Array<ResponseAbilitiesPjInfoDto>;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseEvidencePjInfoDto)
  evidences?: Array<ResponseEvidencePjInfoDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseNarrativePjInfoDto)
  narrative?: Array<ResponseNarrativePjInfoDto>;
}

class ResponseCertificateBasicPjInfoDto {
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
  @Type(() => ResponseAbilitiesPjInfoDto)
  certificateAbilities: Array<ResponseAbilitiesPjInfoDto>;

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

  @IsEnum(CertificateSuccessStatus)
  successStatus?: CertificateSuccessStatus;
}

class ResponseBasicCertificatePjInfoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseCertificateBasicPjInfoDto)
  certificateInfo: Array<ResponseCertificateBasicPjInfoDto>;

  @IsBoolean()
  hasNextPage: boolean;
}

export class ResponseSuccessCertificatesPjInfoDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ResponseBasicCertificatePjInfoDto)
  data?: ResponseBasicCertificatePjInfoDto;
}

class EmissorEventInfo {
  @IsString()
  document: string;

  @IsString()
  name: string;

  @IsString()
  email: string;
}


export class CertificateEmissionListInfo {
  @IsString()
  @IsNotEmpty()
  emissionId: string;

  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsString()
  @IsNotEmpty()
  templateName: string;

  @IsString()
  @IsNotEmpty()
  courseName: string;

  @IsString()
  @IsNotEmpty()
  schoolName: string;

  @IsInt()
  certificateSuccessEvents: number;

  @IsInt()
  certificateFailedEvents: number;

  @IsInt()
  certificatePendingEvents: number;

  @IsDate()
  createdAt: Date;
}

export class CertificateListResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateEmissionListInfo)
  data: CertificateEmissionListInfo[];
}

export class CertificateEmissionListResponseDto {
  response: CertificateListResponse;
}

export class CertificateEventDetailsResponseDto {
  @IsString()
  emissionId: string;

  @IsString()
  templateId: string;

  @IsString()
  templateName: string;

  @IsString()
  courseName: string;

  @Type(() => EmissorEventInfo)
  emissor: EmissorEventInfo;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceptorEventInfo)
  receptors: ReceptorEventInfo[];

  @IsString()
  schoolName: string;

  @IsInt()
  receptorsSucceededQuantity: number;

  @IsInt()
  receptorsFailedQuantity: number;

  @IsInt()
  receptorsPendingQuantity: number;

  @IsDate()
  createdAt: Date;
}

export class ReceptorEventInfo {
  @IsString()
  document: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(CertificateSuccessStatus)
  certificateSuccessStatus: CertificateSuccessStatus;
}
