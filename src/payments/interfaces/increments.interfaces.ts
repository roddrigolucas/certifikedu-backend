export interface IIncrementForSubs {
  cycles: number,
  value: number,
  isFlat: boolean,
}

export interface ICreateIncrementOnSubscription {
  discountId: string,
  startedAt: Date,
  pagarmeDiscountId: string,
  expiresAt: Date,
  cycles: Array<number>,
}
