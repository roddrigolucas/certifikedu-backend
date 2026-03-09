export interface IIncludeSubscriptionDiscountPagarme {
  value: number;
  discount_type: 'flat' | 'percentage';
  cycles: string;
  item_id?: string;
}
