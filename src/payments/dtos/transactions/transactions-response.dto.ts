import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";


class CreditsInfoTransactionsDto {
  @IsString()
  totalBalance: string;

  @IsString()
  additionalCredits: string;
}

class CreatedCreditTransactionsResponse {
  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => CreditsInfoTransactionsDto)
  data: CreditsInfoTransactionsDto;
}

export class ResponseCertificateCreditTransactionsDto {
  @IsString()
  status: string;

  @ValidateNested()
  @Type(() => CreatedCreditTransactionsResponse)
  response: CreatedCreditTransactionsResponse;
}
