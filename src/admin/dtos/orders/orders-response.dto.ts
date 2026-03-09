import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsNumber, IsString, ValidateNested } from "class-validator";

export class ResponseUserOrderChargesAdminDto {
  @IsString()
  chargeId: string;

  @IsNumber()
  amount: number;

  @IsString()
  paymentMethod: string;

  @IsString()
  status: string;

  @IsString()
  description: string;

  @IsDate()
  dueAt: Date;

  @IsDate()
  pagarmeCreatedAt: Date;

  @IsDate()
  pagarmeUpdatedAt: Date;
}

class ResponseUserOrderItemsAdminDto {
  @IsString()
  orderItemId: string;

  @IsString()
  status: string;

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  quantity: number;

  @IsDate()
  pagarmeCreatedAt: Date;

  @IsDate()
  pagarmeUpdatedAt: Date;
}

export class ResponseUserOrdersAdminDto {
  @IsString()
  orderId: string;

  @IsBoolean()
  closed: boolean;

  @IsString()
  status: string;

  @IsDate()
  pagarmeCreatedAt: Date;

  @IsDate()
  pagarmeUpdatedAt: Date;

  @IsDate()
  pagarmeClosedAt?: Date;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ResponseUserOrderItemsAdminDto)
  items: Array<ResponseUserOrderItemsAdminDto>
  
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ResponseUserOrderChargesAdminDto)
  charges: Array<ResponseUserOrderChargesAdminDto>
}

export class ResponseListUsersOrdersAdminDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseUserOrdersAdminDto)
  orders: Array<ResponseUserOrdersAdminDto>;

  @IsNumber()
  total?: number;

  @IsString()
  next?: string;

  @IsString()
  previous?: string;
}
