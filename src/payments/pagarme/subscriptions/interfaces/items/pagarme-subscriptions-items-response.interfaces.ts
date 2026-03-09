import { IDiscountResponsePagarme } from '../discounts/pagarme-subscriptions-discounts-response.interfaces';
import { IIncrementResponsePagarme } from '../increments/pagarme-subscriptions-increments-response.interfaces';

export interface ISubscriptionItemResponsePagarme {
  id: string;
  name: string;
  description: string;
  cycles: number;
  quantity: number;
  status: 'active';
  created_at: string;
  updated_at: string;
  pricing_scheme: {
    price: number;
    minimum_price: number;
    scheme_type: string;
  };
  discounts?: Array<IDiscountResponsePagarme>;
  increments?: Array<IIncrementResponsePagarme>;
  subscription?: {
    id: string;
    code: string;
    start_at: string;
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count: number;
    billing_type: 'prepaid' | 'postpaid' | 'exact_day';
    next_billing_at: string;
    payment_method: 'credit_card' | 'debit_card' | 'boleto';
    currency: 'BRL';
    statement_descriptor?: string;
    installments: number;
    status: 'active' | 'deleted' | 'inactive';
    created_at: string;
    updated_at: string;
    metadata: {
      subscriptionId: string;
      userId: string;
    };
  };
}

export interface IListSubscriptionItemsResponsePagarme {
  data: Array<ISubscriptionItemResponsePagarme>;
  paging: {
    total: number;
    previous?: string;
    next?: string;
  };
}
