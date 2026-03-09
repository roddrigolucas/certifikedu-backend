import { IResponseUsersRawInfo } from '../../../../../src/auth/interfaces/auth.interfaces';
import { TUserCreateInput } from '../../../../../src/auth/types/auth.types';

export const authInputs = {
  existingDocument: '11111111111',
  existingEmail: 'exists@email.com',
  nonExistingDocument: '22222222222',
  nonExistingEmail: 'new@email.com',
  tempRawUserName: 'Temp Name',
  tempRawUserPhone: '86792792873',
};

export const rawUserInput: TUserCreateInput = {
  email: authInputs.nonExistingEmail,
  numeroDocumento: authInputs.nonExistingDocument,
  type: 'PF',
  tempName: authInputs.tempRawUserName,
  tempPhone: authInputs.tempRawUserPhone,
};

export const rawUserResponseDictInput: IResponseUsersRawInfo = {
  name: authInputs.tempRawUserName,
  email: authInputs.nonExistingEmail,
  documentNumber: authInputs.nonExistingDocument,
  phone: authInputs.tempRawUserPhone,
  isValid: true,
};
