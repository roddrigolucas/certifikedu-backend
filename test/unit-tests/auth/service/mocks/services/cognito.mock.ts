export const mockCognitoService = {
  checkUserCognito: jest.fn().mockResolvedValue({
    cognito: {
      Users: [],
    },
  }),
  adminCreateNewUserCognito: jest.fn().mockResolvedValue({}),
};
