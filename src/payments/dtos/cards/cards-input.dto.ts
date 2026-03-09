import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class BillingAddressCardsDto {
  @IsString()
  streetNumber: string;

  @IsString()
  street: string;

  @IsString()
  neighborhood: string;

  @IsString()
  complementary?: string;

  @IsString()
  zipCode: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  @IsOptional()
  additonalDetails?: string;
}

export class CreateCreditCardDto {
  @IsString()
  holderName: string;

  @IsString()
  holderDocument: string;

  @IsString()
  number: string;

  @IsString()
  cvv: string;

  @IsNumber()
  expMonth: number;

  @IsNumber()
  expYear: number;

  @ValidateNested()
  @Type(() => BillingAddressCardsDto)
  billing_address?: BillingAddressCardsDto;

  @IsBoolean()
  setDefault: boolean;
}
