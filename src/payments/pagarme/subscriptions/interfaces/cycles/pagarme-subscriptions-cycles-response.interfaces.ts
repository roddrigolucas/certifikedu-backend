export interface ISubscriptionCycleResponsePagarme {
  id: string;
  billing_at: string;
  cycle: number;
  start_at: string;
  end_at: string;
  duration: number;
  created_at: string;
  updated_at: string;
  status: 'billed' | 'unbilled';
}

export interface IListSubscriptionCycleResponsePagarme {
  data: Array<ISubscriptionCycleResponsePagarme>;
  paging: {
    total: number;
    previous?: string;
    next?: string;
  };
}
