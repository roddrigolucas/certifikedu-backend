import { mockTransactionsService } from '../mock/transaction-service.mock';
import { mockPaymentsService } from '../mock/payments-service.mock';

export const mockCustomerService = {
  customerId: 'customerId',
  getCustomerIdByUserId: jest.fn().mockImplementation((userId: string) => {
    if (!userId) {
      return null;
    } else if (userId === mockTransactionsService.customerIdForOrderErr) {
      return mockTransactionsService.customerIdForOrderErr;
    } else if (userId === mockPaymentsService.customerIdforPriceErr) {
      return mockTransactionsService.customerIdForOrderErr;
    } else {
      return 'customerId';
    }
  }),
};
