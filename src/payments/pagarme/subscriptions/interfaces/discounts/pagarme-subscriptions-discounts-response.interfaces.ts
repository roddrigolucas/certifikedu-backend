export interface ISubscriptionDiscountResponsePagarme {
  id: string;
  value: number;
  discount_type: 'flat' | 'percentage';
  status: 'active' | 'deleted';
  created_at: string;
  cycles: number;
  item_id?: string;
  subscription: {
    id: string;
    code: string;
    start_at: string;
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count: number;
    billing_type: string;
    next_billing_at: string;
    payment_method: 'credit_card' | 'debit_card' | 'boleto';
    statement_descriptor?: string;
    currency: 'BRL';
    installments: number;
    status: 'active' | 'canceled' | 'future';
    created_at: string;
    updated_at: string;
  };
}

export interface IDiscountResponsePagarme {
  id: string;
  value: number;
  cycles: number;
  discount_type: 'flat' | 'percentage';
  status: 'active' | 'deleted';
  created_at: string;
  item_id?: string;
}

export interface IListSubscriptionsDiscountResponsePagarme {
  data: Array<ISubscriptionDiscountResponsePagarme>;
}
