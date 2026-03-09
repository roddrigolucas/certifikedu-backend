export interface ICreateSubscriptionPagarme {
  code: string;
  description: string;
  payment_method: 'credit_card' | 'debit_card';
  currency: 'BRL';
  start_at?: string;
  interval: 'day' | 'week' | 'month' | 'year';
  minimum_price: number;
  interval_count: number;
  billing_type: 'prepaid' | 'postpaid' | 'exact_day';
  billing_day?: number;
  installments: number;
  statement_descriptor: string;
  customer_id: string;
  card_id: string;
  items?: {
    name: string;
    quantity: string;
    description: string;
    pricing_scheme: {
      scheme_type: 'Unit';
      price: number;
      minimum_price?: number;
    };
  };
  pricing_scheme?: {
    scheme_type: 'Unit';
    price: number;
    minimum_price?: number;
  };
  quantity?: number;
  discounts?: {
    cycles: number;
    value: number;
    discount_type: 'flat' | 'percentage';
  };
  increments?: {
    cycles: number;
    value: number;
    increment_type: 'flat' | 'percentage';
  };
  setup?: {
    amount: number;
    description: string;
  };
  metadata: {
    userId: string;
  };
}

export interface ICreatePlannedSubscriptionPagarme {
  code: string;
  plan_id: string;
  payment_method: 'credit_card' | 'debit_card';
  start_at?: Date;
  customer_id: string;
  card_id: string;
  installments: number;
  discounts?: {
    cycles: number;
    value: number;
    discount_type: 'flat' | 'percentage';
  };
  increments?: {
    cycles: number;
    value: number;
    increment_type: 'flat' | 'percentage';
  };
  metadata: {
    userId: string;
  };
}

export interface IListSubscriptionsQueryPagarme {
  next?: string;
  status?: string;
  code?: string;
  billing_type?: string;
  customer_id?: string;
  plan_id?: string;
  card_id?: string;
  next_billing_since?: Date;
  next_billing_until?: Date;
  created_since?: Date;
  created_until?: Date;
  page: number;
  size: number;
}

export interface ICancelSubscriptionPagarme {
  cancel_pending_invoices: boolean;
}

export interface IEditSubscriptionCardPagarme {
  card_id: string;
}

export interface IEditSubscriptionStartDatePagarme {
  start_at: Date;
}

export interface IEditSubscriptionMinimumPricePagarme {
  minimum_price: number;
}
