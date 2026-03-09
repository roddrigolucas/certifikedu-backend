export interface IUserCards {
  userId: string;
  customerId: string;
  cardId: string;
  createdAt: Date;
  updatedAt: Date;
  lastFourDigits: string;
  expMonth: number;
  expYear: number;
  brand: string;
  isDefault: boolean;
}
