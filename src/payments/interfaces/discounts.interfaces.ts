
export interface IDiscountForSubs {
  cycles: number,
  value: number,
  isFlat: boolean,
}

export interface ICreateDiscountOnSubscription {
  discountId: string,
  startedAt: Date,
  pagarmeDiscountId: string,
  expiresAt: Date,
  cycles: Array<number>,
}
