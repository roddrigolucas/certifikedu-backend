export interface ICardLastTransactionResponsePagarme {
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
  card: {
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
  gateway_response: {
    code: string;
    errors: [];
  };
  antifraud_response?: {};
  metadata: {};
}

export interface IPixOpenLastTransactionPagarme {
  id: string;
  transaction_type: 'Pix';
  gateway_id?: string;
  amount: number;
  status: 'waiting_payment';
  success: boolean;
  qr_code: string;
  qr_code_url: string;
  additional_information: [
    {
      name: string;
      value: string;
    },
  ];
  expires_at: string;
  created_at: string;
  updated_at: string;
  gateway_response: {
    code: string;
    errors: Array<any>;
  };
  antifraud_response?: {};
  metadata?: {};
}

export interface IPixLastTransactionResponsePagarme {
  id: string;
  qr_code: string;
  qr_code_url: string;
  expires_at?: string;
  end_to_end_id?: string;
  transaction_type: 'pix';
  gateway_id?: string;
  amount: number;
  status: 'paid' | 'pending_refund' | 'refunded' | 'with_error' | 'failed';
  success: boolean;
  created_at: string;
  updated_at: string;
  payer: {
    name: string;
    document_type?: string;
    document?: string;
    bank_account?: {
      bank_name: string;
      ispb: string;
    };
  };
  gateway_response: {
    code: string;
    errors: Array<any>;
  };
  antifraud_response?: {};
  metadata?: {};
}
