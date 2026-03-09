export interface ICreateCustomerPagarme {
  name: string;
  email: string;
  code: string;
  document: string;
  document_type: 'CPF' | 'CNPJ' | 'PASSPORT';
  type: 'individual' | 'Company';
  birthdate: Date;
  gender?: 'male' | 'female';
  address: {
    country: 'BR';
    state: string;
    city: string;
    zip_code: string;
    line_1: string;
    line_2?: string;
  };
  phones?: {
    mobile_phone: {
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
  metadata: {
    userId: string;
    environment: string;
  };
}

export interface IEditCustomerPagarme {
  name: string;
  email: string;
  code: string;
  document: string;
  document_type: 'CPF' | 'CNPJ' | 'PASSPORT';
  type: 'individual' | 'Company';
  gender?: 'male' | 'female';
  birthdate: Date;
  metadata: {
    updatedAt: Date;
    environment: string;
  };
}

export interface IQueryCustomerPagarme {
  next?: string;
  name?: string;
  document?: string;
  email?: string;
  code?: string;
  gender?: 'male' | 'female';
  page: number;
  size: number;
}
