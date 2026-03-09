import { BillingTypeEnum, PaymentMethodEnum, QuotaPeriod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class PriceDataDto {
  @IsString()
  price: string;
}

export class ResponseSuccess {
  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => PriceDataDto)
  data: PriceDataDto;
}

export class ResponseUserCertificatePriceInternalDto {
  @IsString()
  status: string;

  @ValidateNested()
  @Type(() => ResponseSuccess)
  response: ResponseSuccess;
}

export class ResponseUserCreditsInternalDto {
  @IsString()
  customerId: string;

  @IsString()
  plan: string;

  @IsNumber()
  certificateCredits: number;

  @IsNumber()
  additionalCertificatesCredits: number;

  @IsNumber()
  monthSpentCredits: number;

  @IsDate()
  nextCertificateDate?: Date;

  @IsString()
  subsciptionId: string;
}

class ResponsePriceSchemeInternalDto {
  @IsNumber()
  price: number;

  @IsString()
  scheme_type: string;
}

class ResponsePlanItemsInternalDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  cycles: number;

  @ValidateNested()
  @Type(() => ResponsePriceSchemeInternalDto)
  pricing_scheme: ResponsePriceSchemeInternalDto;
}

class PlansDataInternalDto {
  @IsString()
  planId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsBoolean()
  isActive: boolean;

  @IsBoolean()
  recommended: boolean;

  @IsString()
  planName: string;

  @IsString()
  description: string;

  @IsString()
  interval: string;

  @IsArray()
  installments: Array<number>;

  @IsInt()
  @Min(0)
  trialPeriodDays?: number;

  @IsEnum(BillingTypeEnum)
  billingType: BillingTypeEnum;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  billingDays: Array<number>;

  @IsInt()
  @Min(0)
  pdisQty: number;

  @IsEnum(QuotaPeriod)
  pdiPeriod: QuotaPeriod;

  @IsInt()
  @Min(0)
  emittedCertificatesQuota: number;

  @IsEnum(QuotaPeriod)
  emittedCertificatesPeriod: QuotaPeriod;

  @IsInt()
  @Min(0)
  receivedCertificateQuota: number;

  @IsEnum(QuotaPeriod)
  receivedCertificatePeriod: QuotaPeriod;

  @IsInt()
  @Min(0)
  singleCertificatePrice: number;

  @IsInt()
  @Min(0)
  price: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PaymentMethodEnum, { each: true })
  paymentMethod: Array<PaymentMethodEnum>;

  @IsArray()
  @ValidateNested({ each: true })
  items: Array<ResponsePlanItemsInternalDto>;
}

class PlansInfoInternalDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlansDataInternalDto)
  data: Array<PlansDataInternalDto>;
}

export class ResponsePagarmePlansInternalDto {
  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => PlansInfoInternalDto)
  response: PlansInfoInternalDto;
}

export class ResponseInternalPlanInfoInternalDto {
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

export class ResponseInternalPlanDto {
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
