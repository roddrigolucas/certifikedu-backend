export interface IAddressResponsePagarme {
  id: string;
  line_1: string;
  line_2?: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
  status?: 'active' | 'deleted';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    document: string;
    type?: string;
    delinquent: boolean;
    created_at: boolean;
    updated_at: boolean;
    metadata?: {
      environment: string;
      updated_at: string;
    };
  };
  metadata?: {
    internalId: string;
    environment: string;
  };
}

export interface ICustomerAddressResponsePagarme {
  id: string;
  country: string;
  state: string;
  city: string;
  zip_code: string;
  status: 'active';
  line_1: string;
  line_2?: string;
  created_at: string;
  updated_at: string;
}

export interface ICardAddressResponsePagarme {
  country: 'BR';
  state: string;
  city: string;
  zip_code: string;
  line_1: string;
  line_2: string;
}

export interface IListAddressResponsePagarme {
  data: Array<IAddressResponsePagarme>;
  paging: {
    total: number;
    previous?: string;
    next?: string;
  };
}
