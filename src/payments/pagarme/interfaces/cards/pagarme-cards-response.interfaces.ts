import { ICardAddressResponsePagarme } from '../address/pagarme-address-response.interfaces';

export interface ICardResponsePagarme {
  id: string;
  first_six_digits: string;
  last_four_digits: string;
  brand?: string;
  holder_name?: string;
  holder_document?: string;
  exp_month: number;
  exp_year: number;
  status: 'active' | 'deleted' | 'expired';
  created_at: string;
  updated_at: string;
  billing_address: ICardAddressResponsePagarme;
  customer: {
    id: string;
    name: string;
    email: string;
    document: string;
    type: string;
    delinquent: boolean;
    created_at: string;
    updated_at: string;
    phones: {
      home_phone?: {
        country_code: '55';
        number: string;
        area_code: string;
      };
      mobile_phone?: {
        country_code: '55';
        number: string;
        area_code: string;
      };
    };
    metadata: {
      userId: string;
      environment: string;
      isDefault: boolean;
    };
  };
  type: 'credit' | 'voucher';
}

export interface ISubscriptionCardResponsePagarme {
  id: string;
  first_six_digits: string;
  last_four_digits: string;
  brand: string;
  holder_name: string;
  holder_document?: string;
  exp_month: number;
  exp_year: number;
  status: 'active' | 'deleted' | 'expired';
  created_at: string;
  updated_at: string;
  billing_address: ICardAddressResponsePagarme;
  type: 'credit' | 'voucher';
}

export interface IListCardsResponsePagarme {
  data: Array<ICardResponsePagarme>;
  paging: {
    total: number;
    next?: string;
    previous?: string;
  };
}
