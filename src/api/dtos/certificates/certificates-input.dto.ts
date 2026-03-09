import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ResponseAbilitiesAPIDto } from '../abilities/abilities-response.dto';

export class CreateNewCertificateAPIDto {
  @IsString()
  @IsNotEmpty()
  receptorDoc: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  hoursWorkload: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseAbilitiesAPIDto)
  abilities: Array<ResponseAbilitiesAPIDto>;

  @IsString()
  @IsOptional()
  issuedAt?: string;

  @IsString()
  @IsOptional()
  expiresAt?: string;

  @IsString()
  schoolCnpj: string;

  @IsOptional()
  evidences?: Express.Multer.File[];

  @IsOptional()
  narrative?: Express.Multer.File;
}

export class CreateNarrativeAPIDto {
  @IsString()
  @IsOptional()
  narrativeDescription?: string;

  @IsString()
  narrativeUrl: string;

  @IsString()
  narrativeType: string;

  @IsString()
  createdByUser: string;

  @IsString()
  certificateId: string;
}

export class CreateEvidenceAPIDto {
  @IsString()
  evidenceType: string;

  @IsString()
  evidenceUrl: string;

  @IsString()
  createdByUser: string;

  @IsString()
  certificateId: string;
}
