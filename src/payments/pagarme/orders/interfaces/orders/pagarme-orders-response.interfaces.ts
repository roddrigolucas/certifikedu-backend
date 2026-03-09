import { ICustomerResponsePagarme } from 'src/payments/pagarme/interfaces/customers/pagarme-customers-response.interfaces';
import { IChargeResponsePagarme } from '../charges/pagarme-charges-response.interfaces';
import {
  ICardLastTransactionResponsePagarme,
  IPixLastTransactionResponsePagarme,
  IPixOpenLastTransactionPagarme,
} from '../charges/pagarme-last-transactions.interfaces';
import { IOrderItemResponsePagarme } from '../items/pagarme-orders-items-response.interfaces';

export interface IOrderResponsePagarme<T> {
  id: string;
  code?: string;
  amount: number;
  currency?: 'BRL';
  closed: boolean;
  status: 'pending' | 'paid' | 'canceled' | 'failed';
  created_at: string;
  updated_at: string;
  closed_at?: string;
  items: Array<IOrderItemResponsePagarme>;
  customer: ICustomerResponsePagarme;
  charges: Array<IChargeResponsePagarme<T>>;
}

interface IOrderWithoutCharges {
  id: string;
  code?: string;
  amount: number;
  currency?: 'BRL';
  closed: boolean;
  status: 'pending' | 'paid' | 'canceled' | 'failed';
  created_at: string;
  updated_at: string;
  closed_at?: string;
  items: Array<IOrderItemResponsePagarme>;
  customer: ICustomerResponsePagarme;
}

export interface IListOrdersResponsePagarme {
  data: Array<
    IOrderResponsePagarme<
      IPixLastTransactionResponsePagarme | ICardLastTransactionResponsePagarme | IPixOpenLastTransactionPagarme
    >
  >;
  paging: {
    total: number;
    next?: string;
    previous?: string;
  };
}

export interface ITreatedOrdersResponsePagarme {
  orders: Array<{
    order: IOrderWithoutCharges;
    charges: {
      pix_open: Array<IChargeResponsePagarme<IPixOpenLastTransactionPagarme>>;
      credit_card: Array<IChargeResponsePagarme<ICardLastTransactionResponsePagarme>>;
      pix_closed: Array<IChargeResponsePagarme<IPixLastTransactionResponsePagarme>>;
    };
  }>;
  paging: {
    total: number;
    next?: string;
    previous?: string;
  };
}
