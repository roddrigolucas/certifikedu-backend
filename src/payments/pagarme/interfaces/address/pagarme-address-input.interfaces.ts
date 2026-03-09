export interface ICreateAddressPagarme {
  line_1: string;
  line_2?: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
  metadata: {
    userId: string;
    environment: string;
  };
}

export interface IEditAddressPagarme {
  line_2: string;
  metadata: {
    internalId: string;
    environment: string;
  };
}

export interface IAddressQueryPagarme {
  next?: string;
  page: number;
  size: number;
}
