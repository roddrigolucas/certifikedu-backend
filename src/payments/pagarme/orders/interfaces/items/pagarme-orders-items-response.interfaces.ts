export interface IOrderItemResponsePagarme {
  id: string;
  description?: string;
  amount: number;
  quantity: number;
  status: 'active' | 'deleted';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  order: {
    id: string;
    code?: string;
    amount: number;
    currency: 'BRL';
    closed: boolean;
    status: 'pending' | 'paid' | 'canceled' | 'failed';
    created_at: string;
    updated_at: string;
    closed_at?: string;
  };
}
