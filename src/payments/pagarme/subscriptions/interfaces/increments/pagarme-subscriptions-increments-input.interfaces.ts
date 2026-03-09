export interface IIncludeSubscriptionIncrementPagarme {
  value: number;
  increment_type: 'flat' | 'percentage';
  cycles?: string;
  item_id?: string;
}
