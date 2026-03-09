export interface IUserCreditsInfo {
  customerId: string,
  plan: string,
  certificateCredits: number,
  additionalCertificatesCredits: number,
  monthSpentCredits: number,
  nextCertificateDate: Date,
  subsciptionId: string,
  planId: string,
}

export enum PaymentType {
  pagarme = 'pagarmeSubscription',
  basic = 'basicSubscription',
  credit = 'credit',
  none = 'null',
}

export interface IUserCertificatePaymentInfo {
  isValid: boolean;
  type: PaymentType;
  id: string;
  next_date: Date;
}

