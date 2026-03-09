import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePlanSubscriptionDto {
  @IsString()
  planId: string;

  @IsNumber()
  installments: number;

  @IsString()
  creditCardId: string;

  @IsString()
  @IsOptional()
  discountCode?: string;
}
