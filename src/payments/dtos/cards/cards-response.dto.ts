import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsNumber, IsString, ValidateNested } from "class-validator";

export class ResponseCreditCardDto {
  @IsString()
  userId: string;

  @IsString()
  customerId: string;

  @IsString()
  cardId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  lastFourDigits: string;

  @IsNumber()
  expMonth: number;

  @IsNumber()
  expYear: number;

  @IsString()
  brand: string;

  @IsBoolean()
  isDefault: boolean;
}

class ResponseSuccessCardsDto {
  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => ResponseCreditCardDto)
  card: ResponseCreditCardDto;
}

export class ResponsePaymentsCardsDto {
  @IsString()
  status: string;

  @ValidateNested()
  @Type(() => ResponseSuccessCardsDto)
  response: ResponseSuccessCardsDto;
}

class ResponseCardsDataDto {
  @IsString()
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseCreditCardDto)
  cards: Array<ResponseCreditCardDto>;
}

export class ResponseCardsDto {
  @IsString()
  status: string;

  @ValidateNested()
  @Type(() => ResponseCardsDataDto)
  response: ResponseCardsDataDto;
}

