const cardId = 'cardId_test';

export const mockCardsService = {
  cardId: cardId,
  checkCardById: jest.fn().mockImplementation((creditCardId: string, _: string) => {
    if (!creditCardId) {
      return null;
    } else {
      return cardId;
    }
  }),
};
