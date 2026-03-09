export interface ISubscriptionPlanResponsePagarme {
  id: string;
  name: string;
  url: string;
  currency: string;
  interval: string;
  interval_count: number;
  billing_type: 'prepaid' | 'postpaid' | 'exact_day';
  installments: number;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: {
    pdisQty: number;
    pdiPeriod: string;
    emittedCertificatesQuota: number;
    emittedCertificatesPeriod: string;
    receivedCertificateQuota: number;
    receivedCertificatePeriod: string;
  };
}

export interface IPlanItemResponsePagarme {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  cycles?: number;
  status?: 'active' | 'inactive' | 'deleted';
  interval?: 'day' | 'week' | 'month' | 'year';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  pricing_scheme: {
    scheme_type: 'Unit';
    price: number;
    minimum_price?: number;
  };
  plan?: IPlanResponsePagarme;
}

export interface IPlanResponsePagarme {
  id: string;
  name: string;
  url: string;
  minimum_price: number;
  interval_count: number;
  billing_type: 'prepaid' | 'postpaid' | 'exact_day';
  payment_methods: Array<'credit_card' | 'boleto' | 'debit_card'>;
  installments: Array<number>;
  interval: string;
  status: 'active';
  status_reason: string;
  currency: 'BRL';
  created_at: string;
  updated_at: string;
  items: Array<IPlanItemResponsePagarme>;
  metadata?: {
    pdisQty: number;
    pdiPeriod: string;
    environment: string;
    emittedCertificatesQuota: number;
    emittedCertificatesPeriod: string;
    receivedCertificateQuota: number;
    receivedCertificatePeriod: string;
  };
}

export interface IListPlanResponsePagarme {
  data: Array<IPlanResponsePagarme>;
  paging: {
    total: number;
    next?: string;
    previous?: string;
  };
}
