import {
  ICardLastTransactionResponsePagarme,
  IPixLastTransactionResponsePagarme,
  IPixOpenLastTransactionPagarme,
} from './pagarme-last-transactions.interfaces';

export interface IChargeResponsePagarme<T> {
  id: string;
  code: string;
  gateway_id?: string;
  amount: string;
  status: 'pending' | 'paid' | 'canceled' | 'processing' | 'failed' | 'overpaid' | 'underpaid' | 'chargedback';
  currency: 'BRL';
  payment_method: 'credit_card' | 'debit_card' | 'pix';
  due_at?: string;
  paid_at?: string;
  funding_source?: string;
  created_at: string;
  updated_at: string;
  customer: {
    id: string;
    name?: string;
    email?: string;
    delinquent?: boolean;
    type?: string;
    created_at: string;
    updated_at: string;
    phones?: {
      mobile_phone?: {
        country_code?: string;
        area_code: string;
        number: string;
      };
      home_phone?: {
        country_code?: string;
        area_code: string;
        number: string;
      };
    };
  };
  last_transaction: T;
}

export interface IListChargesResponsePagarme {
  data: Array<
    IChargeResponsePagarme<
      IPixLastTransactionResponsePagarme | ICardLastTransactionResponsePagarme | IPixOpenLastTransactionPagarme
    >
  >;
  paging: {
    total: number;
    next?: string;
    previous?: string;
  };
}

export interface ITreatedChargesResponsePagarme {
  credit_cards: Array<IChargeResponsePagarme<ICardLastTransactionResponsePagarme>>;
  pix_open: Array<IChargeResponsePagarme<IPixOpenLastTransactionPagarme>>;
  pix_closed: Array<IChargeResponsePagarme<IPixLastTransactionResponsePagarme>>;
  paging: {
    total: number;
    next?: string;
    previous?: string;
  };
}
