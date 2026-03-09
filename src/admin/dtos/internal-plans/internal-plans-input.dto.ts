import { QuotaPeriod } from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateOrEditInternalPlanAdminDto {
  @IsString()
  description: string;

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

