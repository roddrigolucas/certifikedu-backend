import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateInternalEmailTemplateAdminDto {
  @IsString()
  templateKey: string;

  @IsString()
  templateName: string;

  @IsBoolean()
  deletable: boolean;

  @IsString()
  subject: string;

  @IsString()
  variables: string;

  @IsArray()
  variablesNames: Array<string>;

  @IsArray()
  types: Array<string>;
}

export class UpdateInternalEmailTemplateAdminDto {
  @IsString()
  @IsOptional()
  templateKey?: string;

  @IsOptional()
  @IsString()
  templateName?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  variables?: string;

  @IsArray()
  @IsOptional()
  variablesNames?: Array<string>;

  @IsArray()
  @IsOptional()
  types?: Array<string>;
}

