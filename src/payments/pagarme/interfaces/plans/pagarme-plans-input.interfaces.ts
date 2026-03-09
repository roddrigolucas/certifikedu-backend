export interface IIncludePlanItemPagarme {
  name: string;
  description: string;
  quantity: number;
  cycles: number;
  pricing_schema: {
    scheme_type: 'Unit';
    price: number;
    minimun_price: number;
  };
}

export interface IEditPlanItemPagarme {
  name: string;
  description?: string;
  quantity: number;
  cycles?: number;
  pricing_schema: {
    scheme_type: 'Unit';
    price: number;
    minimum_price: number;
  };
}

export interface ICreatePlanPagarme {
  name: string;
  description: string;
  shippable: boolean;
  payment_methods: Array<'credit_card' | 'boleto' | 'debit_card'>;
  installments: Array<number>;
  minimum_price?: number;
  statement_descriptor: string;
  currency: 'BRL';
  interval: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  trial_period_days: number;
  billing_type: 'prepaid' | 'postpaid' | 'exact_day';
  billing_days: Array<number>;
  items: Array<{
    description?: string;
    quantity: number;
    cycles?: number;
    pricing_scheme: {
      scheme_type: 'Unit';
      price: number;
      minimum_price: number;
    };
  }>;
  metadata: {
    pdisQty: number;
    pdiPeriod: string;
    emittedCertificatesQuota: number;
    emittedCertificatesPeriod: string;
    receivedCertificateQuota: number;
    receivedCertificatePeriod: string;
  };
}

export interface IListPlansQueryPagarme {
  name?: string;
  status?: 'active' | 'inactive' | 'deleted';
  created_since?: Date;
  created_until?: Date;
  page: number;
  size: number;
}

export interface IEditPlanMetadataPagarme {
  metadata: {
    pdisQty: number;
    pdiPeriod: string;
    emittedCertificatesQuota: number;
    emittedCertificatesPeriod: string;
    receivedCertificateQuota: number;
    receivedCertificatePeriod: string;
  };
}

export interface IEditPlanPagarme {
  name: string;
  status: 'active' | 'inactive';
  description?: string;
  shippable?: boolean;
  payment_methods?: Array<'credit_card' | 'boleto' | 'debit_card'>;
  installments?: Array<number>;
  minimum_price?: number;
  statement_descriptor?: string;
  currency: 'BRL';
  interval: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  trial_period_days: number;
  billing_type: 'prepaid' | 'postpaid' | 'exact_day';
  billing_days: Array<number>;
  metadata: {
    pdisQty: number;
    pdiPeriod: string;
    environment: string;
    emittedCertificatesQuota: number;
    emittedCertificatesPeriod: string;
    receivedCertificateQuota: number;
    receivedCertificatePeriod: string;
  };
}
