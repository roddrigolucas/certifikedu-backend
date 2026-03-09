import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";


class PriceDataCustomerDto {
  @IsString()
  price: string;
}

class ResponseCustomerDataDto {
  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => PriceDataCustomerDto)
  data: PriceDataCustomerDto;

  @IsString()
  customerId: string;
}

export class ResponseCustomerDto {
  @IsString()
  status: string;

  @ValidateNested()
  @Type(() => ResponseCustomerDataDto)
  response: ResponseCustomerDataDto;
}
