import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PublicTemplateResponseDto {
  @IsNotEmpty()
  @IsString()
  templateId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  hasStarted: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isExpired: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isLimitOfIssuesReached: boolean;
}

export class TemplateCreatedCertificateDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  imageUrl: string;
}

export class TemplateRequestCertificateDto {
  @IsEmail()
  email: string;

  @IsString()
  certificateId: string;
}
