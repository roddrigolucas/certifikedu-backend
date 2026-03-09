import { BillingTypeEnum, PaymentMethodEnum, QuotaPeriod } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class ResponsePriceSchemePagarmeAdminDto {
  @IsNumber()
  price: number;

  @IsString()
  scheme_type: string;
}

class ResponsePagarmePlanItemAdminDto {
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
  @Type(() => ResponsePriceSchemePagarmeAdminDto)
  pricing_scheme: ResponsePriceSchemePagarmeAdminDto;
}

class ResponsePagarmePlansAdminDto {
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
  descriptionPagarme: string;

  @IsString()
  interval: string;

  @IsArray()
  installments: number[];

  @IsInt()
  @Min(0)
  trialPeriodDays?: number;

  @IsEnum(BillingTypeEnum)
  billingType: BillingTypeEnum;

  @IsArray()
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
  @IsEnum(PaymentMethodEnum, { each: true })
  paymentMethod: Array<PaymentMethodEnum>;

  @IsNumber()
  @IsOptional()
  minimum_price?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsePagarmePlanItemAdminDto)
  items: Array<ResponsePagarmePlanItemAdminDto>;
}

class ResponsePagarmePlanInfoAdminDto {
  @ValidateNested()
  @Type(() => ResponsePagarmePlansAdminDto)
  data: ResponsePagarmePlansAdminDto;
}

export class ResponsePagarmePlanAdminDto {
  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => ResponsePagarmePlanInfoAdminDto)
  response: ResponsePagarmePlanInfoAdminDto;
}

class ResponseListPlanInfoAdminDto {
  @IsString()
  planId: string;

  @IsDate()
  createdAt: Date;

  @IsBoolean()
  isDefault: boolean;

  @IsString()
  planName: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  receivedCertificateQuota: number;

  @IsInt()
  @Min(0)
  emittedCertificatesQuota: number;
}

export class ResponseListPlansAdminDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseListPlanInfoAdminDto)
  plans: Array<ResponseListPlanInfoAdminDto>;
}
