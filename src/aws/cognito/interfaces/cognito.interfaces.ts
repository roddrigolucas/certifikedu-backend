export class IRegisterCognitoAPI {
  email: string;
  phoneNumber: string;
  docNumber: string;
  userType: string;
  userId: number;
}

export interface IRegisterOnPoolCognitoRequest {
  email: string;
  docNumber: string;
  phoneNumber: string;
  password: string;
}

export interface IAuthenticateCognitoRequest {
  email: string;
  password: string;
}

export interface IAdminCreateUserCognito {
  email: string;
  password: string;
  userType: string;
}

