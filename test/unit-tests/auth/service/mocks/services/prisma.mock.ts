import { authInputs } from '../../objects/auth.inputs';

export const mockPrismaAuthService = {
  user: {
    findUnique: jest.fn().mockImplementation(({ where: data }) => {
      if (data?.email === authInputs.existingEmail) {
        return {
          numeroDocumento: authInputs.existingDocument,
        };
      }

      if (data?.numeroDocumento === authInputs.existingDocument) {
        return {
          email: authInputs.existingEmail,
        };
      }

      return null;
    }),
    create: jest.fn().mockResolvedValue({}),
  },
};
