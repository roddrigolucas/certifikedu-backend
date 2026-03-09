import { QuotaPeriod } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';

export class ResponseInternalPlanAdminDto {
  @IsString()
  planId: string;

  @IsString()
  description: string;

  @IsBoolean()
  isDefault: boolean;

  @IsString()
  planName: string;

  @IsNumber()
  pdisQty: number;

  @IsEnum(QuotaPeriod)
  pdiPeriod: QuotaPeriod;

  @IsNumber()
  emittedCertificatesQuota: number;

  @IsEnum(QuotaPeriod)
  emittedCertificatesPeriod: QuotaPeriod;

  @IsNumber()
  receivedCertificateQuota: number;

  @IsEnum(QuotaPeriod)
  receivedCertificatePeriod: QuotaPeriod;

  @IsNumber()
  singleCertificatePrice: number;
}
