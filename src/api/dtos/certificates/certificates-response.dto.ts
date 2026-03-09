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
import { ResponseAbilitiesAPIDto } from '../abilities/abilities-response.dto';

export class ResponseEvidenceAPIDto {
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

export class ResponseNarrativeAPIDto {
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

export class ResponseCertificatesAPIDto {
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseAbilitiesAPIDto)
  abilities: Array<ResponseAbilitiesAPIDto>;

  @IsString()
  schoolName: string;

  @IsString()
  schoolCnpj: string;

  @IsBoolean()
  blockchain: boolean;

  @IsBoolean()
  openBadge: boolean;

  @IsDate()
  issuedAt: Date;

  @IsDate()
  expiresAt: Date;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ResponseEvidenceAPIDto)
  evidences?: ResponseEvidenceAPIDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ResponseNarrativeAPIDto)
  narrative?: ResponseNarrativeAPIDto[];
}
