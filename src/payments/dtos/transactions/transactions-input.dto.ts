import { IsNumber, IsString, Min } from 'class-validator';

export class CreateCertificateCreditTransactionsDto {
  @IsString()
  creditCardId: string;

  @IsNumber()
  @Min(1)
  purchasedAmount: number;
}
