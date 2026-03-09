import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateOrUpdateCanvasConfigurationDto {
  @IsString()
  @IsNotEmpty()
  canvasClientIdLTI: string;

  @IsString()
  @IsNotEmpty()
  canvasClientSecretLTI: string;

  @IsString()
  @IsNotEmpty()
  canvasClientIdDevKey: string;

  @IsString()
  @IsNotEmpty()
  canvasClientSecretDevKey: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  canvasDomain: string;
}

export class CreateInternalCanvasConfigurationDto {
  @IsString()
  @IsNotEmpty()
  canvasClientIdLTI: string;

  @IsString()
  @IsNotEmpty()
  canvasClientSecretLTI: string;

  @IsString()
  @IsNotEmpty()
  canvasClientIdDevKey: string;

  @IsString()
  @IsNotEmpty()
  canvasClientSecretDevKey: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  canvasDomain: string;

  @IsString()
  iv: string;
}
