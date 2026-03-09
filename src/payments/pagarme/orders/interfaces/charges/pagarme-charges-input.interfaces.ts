export interface ICaptureChargePagarme {
  amount: number;
  code: string;
}

export interface IEditChargeCreditCardPagarme {
  update_subscription: boolean;
  card_id?: string;
  card?: {
    number: string;
    holder_name: string;
    holder_document: string;
    exp_month: number;
    exp_year: number;
    cvv: string;
    brand?: string;
    label?: string;
    billing_address_id?: string;
    billing_address?: {
      line_1: string;
      line_2: string;
      zip_code: string;
      city: string;
      state: string;
      country: string;
    };
  };
  recurrence_model: 'standing_order' | 'subscription' | 'installment';
}

export interface IEditChargeDueDatePagarme {
  due_at: Date;
}

export interface ICancelChargePagarme {
  amount: number;
}

export interface IListChargesQueryPagarme {
  next?: string;
  code?: string;
  status?: 'pending' | 'paid' | 'canceled' | 'processing' | 'failed' | 'overpaid' | 'underpaid' | 'chargedback';
  payment_method: 'credit_card' | 'pix' | 'debit_card';
  customer_id?: string;
  order_id?: string;
  created_since?: Date;
  created_until?: Date;
  page: number;
  size: number;
}
