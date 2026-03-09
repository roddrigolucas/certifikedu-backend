import { authInputs } from './auth.inputs';

export const checkUserResponses = {
  documentExistsResponse: {
    exist: true,
    errorMessage: `Numero de documento ja esta cadastrado para o email exi****@email.com.`,
  },
  emailExistsResponse: {
    exist: true,
    errorMessage: `Esse email ja esta cadastrado com o numero de documento 111********.`,
  },
  userNotFoundResponse: {
    exist: false,
  },
};

export const rawUsersResponses = {
  signUp: {
    documentError: {
      name: authInputs.tempRawUserName,
      email: authInputs.nonExistingEmail,
      documentNumber: authInputs.existingDocument,
      phone: authInputs.tempRawUserPhone,
      isValid: false,
      error: `Numero de documento ja esta cadastrado para o email exi****@email.com.`,
    },
    emailError: {
      name: authInputs.tempRawUserName,
      email: authInputs.existingEmail,
      documentNumber: authInputs.nonExistingDocument,
      phone: authInputs.tempRawUserPhone,
      isValid: false,
      error: `Esse email ja esta cadastrado com o numero de documento 111********.`,
    },
    success: {
      name: authInputs.tempRawUserName,
      email: authInputs.nonExistingEmail,
      documentNumber: authInputs.nonExistingDocument,
      phone: authInputs.tempRawUserPhone,
      isValid: true,
    },
  },
  resetPassword: {},
};
