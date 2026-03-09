export interface IIncludeSubscriptionItemPagarme {
  name: string;
  description: string;
  cycles: number;
  quantity: number;
  pricing_scheme: {
    scheme_type: 'Unit';
    price: number;
    minimum_price: number;
  };
  discounts?: Array<{
    cycles: number;
    value: number;
    discount_type: 'flat' | 'percentage';
  }>;
  increments?: Array<{
    cycles: number;
    value: number;
    increment_type: 'flat' | 'percentage';
  }>;
}

export interface IListSubscriptionItemsQueryPagarme {
  next?: string
  status?: 'active' | 'deleted';
  name?: string;
  description?: string;
  cycle?: number;
  created_since?: Date;
  created_until?: Date;
  page: number;
  size: number;
}

export interface IEditSubscriptionItemPagarme {
  name: string;
  description: string;
  cycles: number;
  quantity: number;
  pricing_scheme: {
    scheme_type: 'Unit';
    price: number;
    minimum_price: number;
  };
}
