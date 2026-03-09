import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator";


export class CreateDiscountAdminDto {
  @IsString()
  code: string;

  @IsBoolean()
  isFlat: boolean;

  @IsNumber()
  cycles: number;

  @IsNumber()
  value: number;

  @IsNumber()
  total: number;

  @IsDate()
  expiresAt: Date;
}
