import { ISubscriptionCardResponsePagarme } from 'src/payments/pagarme/interfaces/cards/pagarme-cards-response.interfaces';
import { ICustomerResponsePagarme } from 'src/payments/pagarme/interfaces/customers/pagarme-customers-response.interfaces';
import { ISubscriptionPlanResponsePagarme } from 'src/payments/pagarme/interfaces/plans/pagarme-plans-response.interfaces';
import { IDiscountResponsePagarme } from '../discounts/pagarme-subscriptions-discounts-response.interfaces';
import { IIncrementResponsePagarme } from '../increments/pagarme-subscriptions-increments-response.interfaces';
import { ISubscriptionItemResponsePagarme } from '../items/pagarme-subscriptions-items-response.interfaces';

export interface ISubscriptionResponsePagarme {
  id: string;
  payment_method: string;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  start_at: Date;
  billing_type: string;
  minimum_price: number;
  current_cycle: {
    start_at: string;
    end_at: string;
  };
  plan: ISubscriptionPlanResponsePagarme;
  next_billing_at?: string;
  installments: number;
  customer: ICustomerResponsePagarme;
  card: ISubscriptionCardResponsePagarme;
  discounts?: Array<IDiscountResponsePagarme>;
  increments?: Array<IIncrementResponsePagarme>;
  items: Array<ISubscriptionItemResponsePagarme>;
  status: 'active' | 'canceled' | 'future';
  created_at: string;
  updated_at: string;
  metadata: {
    userId: string;
  };
}

export interface IListSubscriptionsResponsePagarme {
  data: Array<ISubscriptionResponsePagarme>;
  paging: {
    total: number;
    previous?: string;
    next?: string;
  };
}
