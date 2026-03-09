export interface ISubscriptionItemUsageResponsePagarme {
  id: string;
  quantity: number;
  status: 'active' | 'deleted';
  used_at: string;
  created_at: string;
  deleted_at?: string;
  subscription_item: {
    id: string;
    description: string;
    quantity: number;
    status: 'active' | 'inactive' | 'deleted';
    created_at: string;
    updated_at: string;
    subscription: {
      id: string;
      code?: string;
      start_at: string;
      interval: 'day' | 'week' | 'month' | 'year';
      interval_count: number;
      billing_type: 'prepaid' | 'postpaid' | 'exact_day';
      next_billing_at: string;
      payment_method: 'credit_card' | 'debit_card';
      currency: 'BRL';
      statement_descriptor?: string;
      installments: number;
      status: 'active' | 'canceled' | 'future';
      created_at: '2017-04-04T18:21:17Z';
      updated_at: '2017-04-04T18:21:17Z';
    };
  };
}

export interface IListSubscriptionItemUsagesResponsePagarme {
  data: Array<{
    id: string;
    quantity: number;
    status: 'active' | 'deleted';
    used_at: string;
    created_at: string;
    deleted_at?: string;
  }>;
  paging: {
    total: number;
    next?: string;
    previous?: string;
  };
}
