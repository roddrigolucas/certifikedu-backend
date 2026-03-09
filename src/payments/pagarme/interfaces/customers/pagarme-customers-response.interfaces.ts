import { ICustomerAddressResponsePagarme } from "../address/pagarme-address-response.interfaces";

export interface ICustomerResponsePagarme {
  id: string;
  name: string;
  email: string;
  document?: string;
  code: string;
  document_type: 'CPF' | 'CNPJ' | 'PASSPORT';
  type: 'individual' | 'Company';
  delinquent: boolean;
  created_at: string;
  updated_at: string;
  birthdate?: string;
  address: ICustomerAddressResponsePagarme;
  phones?: {
    mobile_phone?: {
      country_code: string;
      area_code: string;
      number: string;
    };
    home_phone?: {
      country_code: string;
      area_code: string;
      number: string;
    };
  };
  metadata?: {
    updatedAt: string;
    environment: string;
  };
}

export interface IListCustomerResponsePagarme {
  data: Array<ICustomerResponsePagarme>;
  paging: {
    total: number;
    next?: string;
    previous?: string;
  };
}
