import { IsString } from 'class-validator';

export class LTILoginDto {
  @IsString()
  login_hint: string;

  @IsString()
  client_id: string;

  @IsString()
  target_link_uri: string;

  @IsString()
  lti_message_hint: string;

  @IsString()
  canvas_environment: string;
}
