export interface ISubscriptionInvoiceResponsePagarme {
  id: string;
  code: string;
  url: string;
  amount: number;
  status: 'pending' | 'paid' | 'canceled' | 'scheduled' | 'failed';
  payment_method: 'credit_card' | 'debit_card' | 'boleto';
  installments?: number;
  due_at?: string;
  created_at: string;
  billing_at?: string;
  updated_at?: string;
  canceled_at?: string;
  seen_at?: string;
  total_discount?: number,
  total_increment?: number,
  items: [
    {
      name: string;
      amount: number;
      quantity: number;
      description: string;
    },
  ];
  customer: {
    id: string;
    name: string;
    email: string;
    delinquent: boolean;
    created_at: string;
    updated_at: string;
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
  };
  subscription?: {
    id: string;
    code: string;
    start_at: string;
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count: number;
    billing_type: string;
    next_billing_at: string;
    payment_method: 'credit_card' | 'debit_card' | 'boleto';
    currency: 'BRL';
    statement_descriptor: string;
    installments: number;
    status: 'active' | 'canceled' | 'future';
    created_at: string;
    updated_at: string;
  };
  cycle?: {
    id: string;
    start_at: string;
    end_at: string;
    billing_at: string;
  };
  charge?: {
    id: string;
    code: string;
    gateway_id?: string;
    amount: string;
    status: 'pending' | 'paid' | 'canceled' | 'processing' | 'failed' | 'overpaid' | 'underpaid' | 'chargedback';
    currency: 'BRL';
    payment_method: 'credit_card' | 'debit_card';
    due_at?: string;
    paid_at?: string;
    funding_source?: string;
    created_at: string;
    updated_at: string;
    last_transaction: {
      operation_key?: string;
      id: string;
      transaction_type: string;
      funding_source: string;
      gateway_id: string;
      amount: number;
      status:
      | 'authorized_pending_capture'
      | 'not_authorized'
      | 'captured'
      | 'partial_capture'
      | 'waiting_capture'
      | 'refunded'
      | 'voided'
      | 'partial_refunded'
      | 'partial_void'
      | 'error_on_voiding'
      | 'error_on_refunding'
      | 'waiting_cancellation'
      | 'with_error'
      | 'failed';
      success: boolean;
      installments: number;
      statement_descriptor: string;
      acquirer_name: string;
      acquirer_affiliation_code: string;
      acquirer_tid: string;
      acquirer_nsu: string;
      acquirer_auth_code: string;
      acquirer_message: string;
      acquirer_return_code: string;
      operation_type: 'auth_and_capture' | 'auth_only' | 'pre_auth';
      created_at: string;
      updated_at: string;
      payment_type?: string;
      credit_card: {
        id: string;
        first_six_digits: string;
        last_four_digits: string;
        brand: string;
        holder_name: string;
        exp_month: number;
        exp_year: number;
        status: 'active' | 'deleted' | 'expired';
        created_at: string;
        updated_at: string;
        billing_address: {
          line_1: string;
          line_2?: string;
          zip_code: string;
          city: string;
          state: string;
          country: string;
        };
      };
    };
  };
  metadata?: {
    userId: string;
    environment: string;
  };
}

export interface IListSubscriptionInvoiceResponsePagarme {
  data: Array<ISubscriptionInvoiceResponsePagarme>;
  paging: {
    total: number;
    previous?: string;
    next?: string;
  };
}
