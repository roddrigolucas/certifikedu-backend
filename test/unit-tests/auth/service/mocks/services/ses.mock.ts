export const mockSESService = {
  sendNewUserPassword: jest.fn().mockResolvedValue(null),
  sendRawEmail: jest.fn().mockResolvedValue(null)
};
