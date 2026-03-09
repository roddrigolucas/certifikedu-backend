export interface IIncludeOrderItemPagarme {
  amount: number;
  code: string;
  description: string;
  quantity: number;
  category?: string;
}

export interface IEditOrderItemPagarme {
  amount: number;
  description: string;
  quantity: number;
  category?: string;
}
