import { ResponseCertificateCreditTransactionsDto } from '../../../../../../src/payments/dtos/transactions/transactions-response.dto';

export const createdCertificateCreditsResponse: ResponseCertificateCreditTransactionsDto = {
  status: 'Success',
  response: {
    message: 'Créditos comprados com sucesso',
    data: {
      totalBalance: '4',
      additionalCredits: '2',
    },
  },
};
