export interface ICreateOrderCreditCardPagarme {
  code: string;
  customer_id: string;
  closed: boolean;
  ip?: string;
  session_id?: string;
  antifraud_enabled: false;
  items: Array<{
    amount: number;
    quantity: number;
    description: string;
    code: string;
  }>;
  payments: Array<{
    payment_method: 'credit_card';
    credit_card: {
      operation_type: 'auth_and_capture' | 'auth_only' | 'pre_auth';
      installments: number;
      statement_descriptor: string;
      card_id: string;
      recurrence_cycle?: 'first' | 'subsequent';
      initiated_type?: 'partial_shipment' | 'related_or_delayed_charge' | 'no_show' | 'retry';
      recurrence_model?: 'standing_order' | 'instalment' | 'subscription';
    };
  }>;
}

export interface ICreateOrderPixPagarme {
  code: string;
  closed: boolean;
  ip?: string;
  session_id?: string;
  antifraud_enabled: false;
  customer: {
    name: string;
    email: string;
    type: 'individual';
    document: string;
    phones: {
      mobile_phone: {
        country_code: '55';
        area_code: string;
        number: string;
      };
    };
  };
  items: Array<{
    amount: number;
    quantity: number;
    description: string;
    code: string;
  }>;
  payments: {
    payment_method: 'pix';
    pix: {
      expires_in: number;
      expires_at: Date;
      additional_information: {
        name: string;
        value: string;
      };
    };
  };
}

export interface IIncludeOrderChargeCreditCardPagarme {
  order_id: string;
  customer_id: string;
  amount: string;
  due_at: Date;
  payment: {
    payment_method: 'credit_card';
    credit_card?: {
      operation_type: 'auth_and_capture' | 'auth_only' | 'pre_auth';
      installments: number;
      statement_descriptor: string;
      card_id: string;
      recurrence_cycle?: 'first' | 'subsequent';
      initiated_type?: 'partial_shipment' | 'related_or_delayed_charge' | 'no_show' | 'retry';
      recurrence_model?: 'standing_order' | 'instalment' | 'subscription';
    };
  };
  metadata: {
    userId: string;
  };
}

export interface IIncludeOrderChargePixPagarme {
  order_id: string;
  amount: string;
  due_at: Date;
  customer: {
    name: string;
    email: string;
    type: 'individual';
    document: string;
    phones: {
      mobile_phone: {
        country_code: '55';
        area_code: string;
        number: string;
      };
    };
  };
  payment: {
    payment_method: 'pix';
    pix: {
      expires_in: number;
      expires_at: Date;
      additional_information: {
        name: string;
        value: string;
      };
    };
  };
  metadata: {
    userId: string;
  };
}

export interface ICloseOrderPagarme {
  status: 'paid' | 'canceled' | 'failed';
}

export interface IListOrdersQueryPagarme {
  next?: string;
  code?: string;
  status: 'pending' | 'paid' | 'canceled' | 'failed';
  customer_id?: string;
  created_since?: Date;
  created_until?: Date;
  page: number;
  size: number;
}
