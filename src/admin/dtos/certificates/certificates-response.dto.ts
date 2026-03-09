import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ResponseAbilityAdminDto } from '../abilities/abilities-response.dto';

class CertificateBasicInfoAdminDto {
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
  @Type(() => ResponseAbilityAdminDto)
  certificateAbilities: ResponseAbilityAdminDto[];

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

class ResponsePagCertificatesAdminDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateBasicInfoAdminDto)
  certificateInfo: Array<CertificateBasicInfoAdminDto>;

  @IsBoolean()
  hasNextPage: boolean;
}

export class ResponseCertificatesAdminDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ResponsePagCertificatesAdminDto)
  data?: ResponsePagCertificatesAdminDto;
}
