import { PaymentMethodEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';

class ResponseUserSubscriptionInvoiceChargesAdminDto {
  @IsString()
  chargeId: string;

  @IsString()
  paymentMethod: string;

  @IsNumber()
  amount: string;

  @IsString()
  status: string;

  @IsDate()
  dueAt: Date;

  @IsDate()
  pagarmeCreatedAt: Date;

  @IsDate()
  pagarmeUpdatedAt: Date;
}

class ResponseUserSubscriptionInvoiceAdminDto {
  @IsString()
  url: string;

  @IsNumber()
  amount: number;

  @IsString()
  payment_method: string;

  @IsNumber()
  installments: number;

  @IsString()
  status: string;

  @IsDate()
  billingAt: Date;

  @IsDate()
  seenAt: Date;

  @IsDate()
  dueAt: Date;

  @IsDate()
  canceledAt: Date;

  @IsDate()
  pagarmeCreatedAt: Date;

  @IsDate()
  pagarmeUpdatedAt: Date;

  @IsNumber()
  totalDiscount: number;

  @IsNumber()
  totalIncrement: number;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ResponseUserSubscriptionInvoiceChargesAdminDto)
  charges: Array<ResponseUserSubscriptionInvoiceChargesAdminDto>;
}

class ResponseUserSubscriptionDiscountsAdminDto {
  @IsString()
  pagarmeDiscountId: string;

  @IsDate()
  startedAt: Date;

  @IsDate()
  expiresAt: Date;

  @IsArray()
  cycles: Array<number>;

  @IsString()
  status: string;
}

class ResponseUserSubscriptionIncrementsAdminDto {
  @IsString()
  pagarmeIncrementId: string;

  @IsDate()
  startedAt: Date;

  @IsDate()
  expiresAt: Date;

  @IsArray()
  cycles: Array<number>;

  @IsString()
  status: string;
}

class ResponseUserSubscriptionItemsAdminDto {
  @IsString()
  itemId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  cycles: number;

  @IsString()
  status: string;

  @IsNumber()
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseUserSubscriptionDiscountsAdminDto)
  discounts: Array<ResponseUserSubscriptionDiscountsAdminDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseUserSubscriptionIncrementsAdminDto)
  increments: Array<ResponseUserSubscriptionIncrementsAdminDto>;
}

class ResponseUserSubscriptionCyclesAdminDto {
  @IsDate()
  pagarmeUpdatedAt: Date;

  @IsString()
  status: string;

  @IsNumber()
  cycle: number;

  @IsDate()
  startAt: Date;

  @IsDate()
  endAt: Date;

  @IsDate()
  billingAt: Date;

  @ValidateNested({ each: true })
  @Type(() => ResponseUserSubscriptionInvoiceAdminDto)
  invoice?: ResponseUserSubscriptionInvoiceAdminDto;
}

export class ResponseUserSubscriptionAdminDto {
  @IsString()
  subscriptionId: string;

  @IsDate()
  subscriptionCreatedAt: Date;

  @IsDate()
  subscriptionStartedAt: Date;

  @IsDate()
  subscriptionUpdatedAt: Date;

  @IsDate()
  subscriptionClosedAt: Date;

  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;

  @IsString()
  currency: string;

  @IsString()
  interval: string;

  @IsNumber()
  intervalCount: number;

  @IsNumber()
  minimumPrice: number;

  @IsString()
  billingType: string;

  @IsDate()
  cycleStart: Date;

  @IsDate()
  cycleEnd: Date;

  @IsNumber()
  price: number;

  @IsNumber()
  installments: number;

  @IsDate()
  start_at?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseUserSubscriptionCyclesAdminDto)
  cycles: Array<ResponseUserSubscriptionCyclesAdminDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseUserSubscriptionDiscountsAdminDto)
  discounts: Array<ResponseUserSubscriptionDiscountsAdminDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseUserSubscriptionIncrementsAdminDto)
  increments: Array<ResponseUserSubscriptionIncrementsAdminDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseUserSubscriptionItemsAdminDto)
  items: Array<ResponseUserSubscriptionItemsAdminDto>;
}

export class ResponseListUsersSubscriptionsAdminDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseUserSubscriptionAdminDto)
  subscriptions: Array<ResponseUserSubscriptionAdminDto>;

  @IsNumber()
  total?: number;

  @IsString()
  next?: string;

  @IsString()
  previous?: string;
}
