export interface IListSubscriptionCycleQueryPagarme {
  next?: string;
  id?: string;
  billing_at?: Date;
  cycle?: number;
  start_at?: Date;
  end_at?: Date;
  duration?: string;
  created_at?: Date;
  updated_at?: Date;
  status?: 'billed' | 'unbilled';
}
