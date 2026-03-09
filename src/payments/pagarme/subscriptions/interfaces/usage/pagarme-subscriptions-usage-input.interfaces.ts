export interface IUseSubscriptionItemPagarme {
  quantity: number,
  description: string;
  code: string;
  group?: string;
}

export interface IListSubscriptionItemUsagesQueryPagarme {
  next?: string;
  code?: string;
  group?: string;
  page: number;
  size: number;
}
