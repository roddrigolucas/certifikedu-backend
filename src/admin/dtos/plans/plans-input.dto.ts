import { BillingTypeEnum, PaymentMethodEnum, QuotaPeriod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class PricingSchemePagarmeAdminDto {
  @IsString()
  @IsIn(['Unit'])
  @IsOptional()
  scheme_type?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  minimum_price: number;
}

export class EditPagarmePlanItemAdminDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  quantity: number;

  @ValidateNested()
  @Type(() => PricingSchemePagarmeAdminDto)
  pricing_schema: PricingSchemePagarmeAdminDto;

  @IsNumber()
  @IsOptional()
  cycles?: number;

  @IsString()
  @IsIn(['active'])
  status: string;
}

class PlanItemsPagarmeAdminDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  quantity: number;

  @ValidateNested()
  @Type(() => PricingSchemePagarmeAdminDto)
  pricing_scheme: PricingSchemePagarmeAdminDto;

  @IsNumber()
  @IsOptional()
  cycles?: number;
}

export class CreatePagarmePlanAdminDto {
  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  descriptionPagarme?: string;

  @IsBoolean()
  shippable: boolean;

  @IsArray()
  @IsEnum(PaymentMethodEnum, { each: true })
  payment_methods: Array<PaymentMethodEnum>;

  @IsArray()
  @ArrayNotEmpty()
  installments: Array<number>;

  @IsNumber()
  @IsOptional()
  minimum_price?: number;

  @IsString()
  @MaxLength(22)
  statement_descriptor: string;

  @IsIn(['day', 'week', 'month', 'year'])
  interval: string;

  @IsNumber()
  interval_count: number;

  @IsNumber()
  @IsOptional()
  trial_period_days?: number;

  @IsEnum(BillingTypeEnum)
  billing_type: BillingTypeEnum;

  @IsArray()
  @IsOptional()
  billing_days?: Array<number>;

  @IsString()
  planName: string;

  @IsNumber()
  pdisQty: number;

  @IsString()
  @IsIn(['monthly', 'bimonthly', 'trimontlhy', 'biannually', 'annually', 'forever', 'unlimited'])
  pdiPeriod: QuotaPeriod;

  @IsNumber()
  emittedCertificatesQuota: number;

  @IsString()
  @IsIn(['monthly', 'bimonthly', 'trimontlhy', 'biannually', 'annually', 'forever', 'unlimited'])
  emittedCertificatesPeriod: QuotaPeriod;

  @IsNumber()
  receivedCertificateQuota: number;

  @IsString()
  @IsIn(['monthly', 'bimonthly', 'trimontlhy', 'biannually', 'annually', 'forever', 'unlimited'])
  receivedCertificatePeriod: QuotaPeriod;

  @IsNumber()
  singleCertificatePrice: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanItemsPagarmeAdminDto)
  items: PlanItemsPagarmeAdminDto[];
}

export class EditPagarmePlanAdminDto {
  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  descriptionPagarme?: string;

  @IsBoolean()
  shippable: boolean;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsArray()
  @IsEnum(PaymentMethodEnum, { each: true })
  payment_methods: Array<PaymentMethodEnum>;

  @IsArray()
  @ArrayNotEmpty()
  installments: Array<number>;

  @IsNumber()
  @IsOptional()
  minimum_price?: number;

  @IsString()
  @MaxLength(22)
  statement_descriptor: string;

  @IsIn(['day', 'week', 'month', 'year'])
  interval: string;

  @IsNumber()
  interval_count: number;

  @IsNumber()
  @IsOptional()
  trial_period_days?: number;

  @IsEnum(BillingTypeEnum)
  billing_type: BillingTypeEnum;

  @IsArray()
  @IsOptional()
  billing_days?: Array<number>;

  @IsString()
  planName: string;

  @IsNumber()
  pdisQty: number;

  @IsString()
  @IsIn(['monthly', 'bimonthly', 'trimontlhy', 'biannually', 'annually', 'forever', 'unlimited'])
  pdiPeriod: QuotaPeriod;

  @IsNumber()
  emittedCertificatesQuota: number;

  @IsString()
  @IsIn(['monthly', 'bimonthly', 'trimontlhy', 'biannually', 'annually', 'forever', 'unlimited'])
  emittedCertificatesPeriod: QuotaPeriod;

  @IsNumber()
  receivedCertificateQuota: number;

  @IsString()
  @IsIn(['monthly', 'bimonthly', 'trimontlhy', 'biannually', 'annually', 'forever', 'unlimited'])
  receivedCertificatePeriod: QuotaPeriod;

  @IsNumber()
  singleCertificatePrice: number;
}
