const customerIdforPriceErr = 'PriceErr';

export const mockPaymentsService = {
  customerIdforPriceErr: customerIdforPriceErr,
  getUserCertificatePrice: jest.fn().mockImplementation((userId) => {
    if (userId === customerIdforPriceErr) {
      return null;
    } else {
      return 1;
    }
  }),
  getUserCredits: jest.fn().mockResolvedValue({
    customerId: 'customerId',
    plan: 'planId',
    certificateCredits: 4,
    additionalCertificatesCredits: 2,
    monthSpentCredits: 1,
    nextCertificateDate: new Date(),
    subsciptionId: 'subsciptionId',
    planId: 'planId',
  }),
};
