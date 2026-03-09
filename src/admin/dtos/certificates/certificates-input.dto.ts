import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

enum CertificateStatus {
  REVIEW = 'REVIEW',
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

export class CertificatesPagQueryAdminDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  schoolId?: string;
}


export class UpdateCertificateAdminDto {
  @IsString()
  certificateId: string;

  @IsEnum(CertificateStatus)
  status: CertificateStatus;

}
