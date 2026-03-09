import { IsArray, IsBoolean, IsNumber, IsString } from "class-validator";

export class ResponseInternalEmailTemplateAdminDto {
  @IsString()
  emailId: string;

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

export class ResponseEmailInfoAdminDto {
  @IsNumber()
  statusCode: number;

  @IsString()
  status: string;

  response: { message: string };
}
