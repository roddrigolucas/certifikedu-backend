export interface ICreateCardPagarme {
  number: string;
  holder_name: string;
  holder_document: string;
  exp_month: number;
  exp_year: number;
  cvv: string;
  brand?: string;
  label?: string;
  metadata: {
    userId: string;
    environment: string;
    isDefault: boolean;
  };
  billing_address: {
    line_1: string;
    line_2?: string;
    zip_code: string;
    city: string;
    state: string;
    country: string;
  };
}

export interface IEditCardPagarme {
  number: string;
  holder_name: string;
  holder_document: string;
  exp_month: number;
  exp_year: number;
  billing_address_id: string;
  metadata: {
    userId: string;
    environment: string;
    isDefault: boolean;
  };
}
