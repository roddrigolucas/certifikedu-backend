import { IsString } from 'class-validator';

export class CreateOrUpdateAbilityAdminDto {
  @IsString()
  ability: string;

  @IsString()
  category: string;

  @IsString()
  source: string;
}

