export interface IRecipient {
  type: string;
  hashed: boolean;
  identity: string;
}

export interface IVerification {
  type?: string;
  startsWith?: string;
}

export interface ICriteria {
  narrative: string;
}

export interface IBadge {
  '@context': string;
  type: string;
  id: string;
  name: string;
  description: string;
  image: string;
  criteria: ICriteria;
}

export interface IIssuer {
  '@context': string;
  type: string;
  id: string;
  name: string;
  url: string;
  email: string;
  verification: IVerification;
}

export interface IAssertion {
  '@context': string;
  type: string;
  id: string;
  recipient: IRecipient;
  badge: string;
  issuedOn: string;
  expires?: string;
  verification: IVerification;
}

export interface IBadgeClass {
  '@context': string;
  type: string;
  id: string;
  name: string;
  description: string;
  image: string;
  criteria: ICriteria;
  issuer: string;
}

export interface IIssuer {
  '@context': string;
  type: string;
  id: string;
  name: string;
  url: string;
  email: string;
  verification: IVerification;
}

export interface ICreateOpenBadge {
  certificateId: string;
  recipientEmail: string;
  expires?: string;
  issuedOn: string;
  certificateName: string;
  certificateDescription: string;
  certificateImage: string;
  schoolName: string;
  schoolUrl: string;
  schoolEmail: string;
  narrative?: string;
  openBadgeVersion: number;
  destination_path: string;
  destination_bucket: string;
}

export interface IResponseOpenBadgeClass {
  assertionUrl: string;
  issuerUrl: string;
  badgeUrl: string;
}
