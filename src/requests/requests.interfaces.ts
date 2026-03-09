import { QRCodePositionEnum } from '@prisma/client';

export interface ILambdaValidateText {
  texts: Record<string, string>;
}

interface IOverlapImages {
  template_bucket: string;
  template_path: string;
  destination_bucket: string;
  destination_path: string;
}

export interface IIssueSelfCertificateLambda extends IOverlapImages {
  picture_type: 'certificate';
  receptor_name: string;
  certificate_name: string;
  hash: string;
  qrcode_position: QRCodePositionEnum;
  description_image: string;
  hours: string;
  issued_at: string;
  issuer: string;
  font_description_url?: string
  font_name_url?: string
}

export interface ISignCertificateLambda extends IOverlapImages {
  picture_type: 'sign';
  hash: string;
  receptor_name: string;
  qrcode_position: QRCodePositionEnum;
  font_color: string;
  font_name_url?: string
}

export interface ICreateTemplateLambda extends IOverlapImages {
  picture_type: 'template';
  certificate_name: string;
  hash: string;
  qrcode_position: QRCodePositionEnum;
  description_image: string;
  hours: string;
  issued_at: string;
  issuer: string;
  font_color: string;
  font_description_url?: string
  font_name_url?: string
  badge_bucket?: string;
  badge_path?: string;
}

export interface ICreateCertificatePreview extends IOverlapImages {
  picture_type: 'preview';
  certificate_name: string;
  hash: string;
  qrcode_position: QRCodePositionEnum;
  description_image: string;
  font_color: string;
  font_description_url?: string
  font_name_url?: string
}

export interface ICreateEmailLambdaTemplate {
  templateKey: string;
  templateName: string;
  subject: string;
  variables: string;
}

export interface Is3OperationsLambdaTemplate {
  operation: string;
  bucket: string;
  key?: string;
  content?: any;
  prefix?: string;
}

export interface ICreateResumePdfLambda {
  subject: string; //Path to save PDF
  variables: string; //JSON dumps of IResumePDF
  isPdf: true;
}

export interface IResponseResumePdf {
  success: true;
}

export interface IBakeOpenBadge {
  s3_image_path: string;
  badge_class: Array<IFullOpenBadgeClass>;
  destination_path: string;
  destination_bucket: string;
}

interface IFullOpenBadgeClass {
  '@context': string;
  type: string;
  id: string;
  recipient: Recipient;
  issuedOn: string;
  expires?: string;
  verification: Verification;
  badge: Badge;
  issuer: Issuer;
}

interface Recipient {
  type: string;
  hashed: boolean;
  identity: string;
}

interface Verification {
  type?: string;
  startsWith?: string;
}

interface Criteria {
  narrative: string;
}

interface Badge {
  '@context': string;
  type: string;
  id: string;
  name: string;
  description: string;
  image: string;
  criteria: Criteria;
}

interface Issuer {
  '@context': string;
  type: string;
  id: string;
  name: string;
  url: string;
  email: string;
  verification: Verification;
}

interface IAbilitiesLambda {
  ability: string;
  abilityId: string;
  user_ids: Array<string>;
}

export interface ICreateAbilityEmbeddings {
  mode: 'save_abilities';
  abilities: Array<IAbilitiesLambda>;
}

export interface ICreatePdi {
  pdi_id: string;
  learning_goal: string;
  learning_topics: string;
  previousEducation: string;
  daily_time: string;
}
