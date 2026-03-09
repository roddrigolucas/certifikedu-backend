import { CertificateSuccessStatus } from '@prisma/client';
import { IUpdateProfileAbilitiesLambda } from 'src/candidate/interfaces/candidate.interfaces';
import { IBakeOpenBadge, ISignCertificateLambda } from 'src/requests/requests.interfaces';

export interface ICertificateReceptorInfo {
  docNumber: string;
  name: string;
  email: string;
}

export enum EEmailNameSQS {
  welcome = 'WelcomeEmail',
  template = 'CertificateIssued',
}

export interface ICertificateEventSQS {
  Sign: ISignCertificateLambda;
  OpenBadge: IBakeOpenBadge;
  UpdateAbilities?: IUpdateProfileAbilitiesLambda;
  EmailInfo: {
    email: string;
    templateName: EEmailNameSQS;
    templateData: {
      imageUrl: string;
      name: string;
    };
  };
}

export interface IReceptorInfo {
  document: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  certificateSuccessStatus: CertificateSuccessStatus;
}

export interface IConcatenatedReceptorsInfo {
  existingUsers: IReceptorInfo[];
  nonExistingUsers: IReceptorInfo[];
}

export interface ICertificateEmissionsListInfo {
  emissionId: string;
  templateId: string;
  templateName: string;
  courseName: string;
  schoolName: string;
  certificateSuccessEvents: number;
  certificateFailedEvents: number;
  certificatePendingEvents: number;
  createdAt: Date;
}

export interface ICertificateEmissionListPag {
  page?: number;
  limit?: number;
}
