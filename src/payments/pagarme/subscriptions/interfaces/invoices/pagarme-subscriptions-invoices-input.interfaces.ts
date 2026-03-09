export interface ICreateSubscriptionInvoicePagarme {
  metadata: {
    userId: string;
  }
}

export interface IListSubscriptionInvoiceQueryPagarme {
  next?: string;
  status?: 'pending' | 'paid' | 'canceled' | 'scheduled' | 'failed';
  customer_id?: string;
  subscription_id?: string;
  due_since?: Date;
  due_until?: Date;
  created_since?: Date;
  created_until?: Date;
  page: number;
  size: number;
}

export interface IEditSubscriptionInvoiceMetadataPagarme {
  metadata: {
    userId: string;
  }
}

