const customerIdForOrderErr = 'OrderErr';

export const mockTransactionsService = {
  customerIdForOrderErr: customerIdForOrderErr,
  createCertificateCreditOrder: jest
    .fn()
    .mockImplementation((customerId: string, _: string, __: number, ___: number) => {
      if (customerId === customerIdForOrderErr) {
        return null;
      } else {
        return true;
      }
    }),
};
