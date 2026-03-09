import { BillingTypeEnum, PaymentMethodEnum, QuotaPeriod } from '@prisma/client';

export interface ICreatePlan {
  description: string;
  descriptionPagarme?: string;
  shippable: boolean;
  payment_methods: Array<PaymentMethodEnum>;
  installments: Array<number>;
  minimum_price?: number;
  statement_descriptor: string;
  interval: string;
  interval_count: number;
  trial_period_days?: number;
  billing_type: BillingTypeEnum;
  billing_days?: Array<number>;
  planName: string;
  pdisQty: number;
  pdiPeriod: QuotaPeriod;
  emittedCertificatesQuota: number;
  emittedCertificatesPeriod: QuotaPeriod;
  receivedCertificateQuota: number;
  receivedCertificatePeriod: QuotaPeriod;
  singleCertificatePrice: number;
  price?: number;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    cycles?: number;
    pricing_scheme: {
      scheme_type?: string;
      price: number;
      minimum_price: number;
    };
  }>;
}

export interface IEditPlan {
  description: string;
  descriptionPagarme?: string;
  shippable: boolean;
  payment_methods: Array<PaymentMethodEnum>;
  installments: Array<number>;
  minimum_price?: number;
  statement_descriptor: string;
  interval: string;
  interval_count: number;
  trial_period_days?: number;
  billing_type: BillingTypeEnum;
  billing_days?: Array<number>;
  planName: string;
  pdisQty: number;
  pdiPeriod: QuotaPeriod;
  emittedCertificatesQuota: number;
  emittedCertificatesPeriod: QuotaPeriod;
  receivedCertificateQuota: number;
  receivedCertificatePeriod: QuotaPeriod;
  singleCertificatePrice: number;
  price?: number;
}

export interface IEditPlanItem {
  name: string;
  description?: string;
  quantity?: number;
  cycles?: number;
  status: string;
  pricing_schema: {
    price: number;
    scheme_type?: string;
    minimum_price: number;
  };
}
