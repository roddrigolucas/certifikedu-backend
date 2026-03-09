import { CreateCertificateCreditTransactionsDto } from '../../../../../../src/payments/dtos/transactions/transactions-input.dto';

export const createCertificateCreditTransactionDto: CreateCertificateCreditTransactionsDto = {
  creditCardId: '1111222233334444',
  purchasedAmount: 2,
}

export const cardNotFoundDto: CreateCertificateCreditTransactionsDto = {
  creditCardId: null,
  purchasedAmount: 2,
}

