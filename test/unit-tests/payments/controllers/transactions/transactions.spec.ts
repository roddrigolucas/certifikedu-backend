import { Test } from '@nestjs/testing';
import { ServiceUnavailableException, NotFoundException } from '@nestjs/common';

import { TransactionsController } from '../../../../../src/payments/controllers/transactions.controller';

// DEPS
import { RolesGuard } from '../../../../../src/users/guards';
import { CardsService } from '../../../../../src/payments/services/cards.service';
import { TransactionsService } from '../../../../../src/payments/services/transactions.service';
import { CustomerService } from '../../../../../src/payments/services/customer.service';
import { PaymentsService } from '../../../../../src/payments/services/payments.service';

// MOCKS
import { mockPaymentsService } from './mock/payments-service.mock';
import { mockCustomerService } from './mock/customer-service.mock';
import { mockTransactionsService } from './mock/transaction-service.mock';
import { mockCardsService } from './mock/cards-service.mock';

// OBJS
import { cardNotFoundDto, createCertificateCreditTransactionDto } from './objects/inputs.obj';
import { createdCertificateCreditsResponse } from './objects/responses.obj';

const rolesGuardMock = {
  canActivate: jest.fn().mockResolvedValue(true),
};

describe('Payment - Transactions Controller Unit Tests', () => {
  let transactionController: TransactionsController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: CardsService, useValue: mockCardsService },
        { provide: PaymentsService, useValue: mockPaymentsService },
        { provide: CustomerService, useValue: mockCustomerService },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    transactionController = moduleRef.get(TransactionsController);
  });

  it('Should be instantiated', () => {
    expect(transactionController).toBeDefined();
  });

  describe('Certificate Credits', () => {
    it('Should Throw Service Unavailable if ID is not returned', async () => {
      await expect(
        transactionController.createCertificateCredit(null, createCertificateCreditTransactionDto),
      ).rejects.toThrow(new ServiceUnavailableException('Unable to create customer'));
    });

    it('Should Throw Not Found if Card Id is not returned', async () => {
      await expect(
        transactionController.createCertificateCredit(mockCustomerService.customerId, cardNotFoundDto),
      ).rejects.toThrow(new NotFoundException('Card not found'));
    });

    it('Should Throw Service Unavailable if price is not retrieved', async () => {
      await expect(
        transactionController.createCertificateCredit(
          mockPaymentsService.customerIdforPriceErr,
          createCertificateCreditTransactionDto,
        ),
      ).rejects.toThrow(new ServiceUnavailableException('Unable to retrieve price for customer'));
    });

    it('Should Throw Service Unavailable if order is not completed', async () => {
      await expect(
        transactionController.createCertificateCredit(
          mockTransactionsService.customerIdForOrderErr,
          createCertificateCreditTransactionDto,
        ),
      ).rejects.toThrow(new ServiceUnavailableException('Unable to process payment'));
    });

    it('Should Create Certificate Credits', async () => {
      const response = await transactionController.createCertificateCredit(
        mockCustomerService.customerId,
        createCertificateCreditTransactionDto,
      );

      expect(response).toStrictEqual(createdCertificateCreditsResponse);
    });
  });
});
