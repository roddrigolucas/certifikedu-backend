import { IsString } from 'class-validator';

export class CreateOrUpdateAbilityDto {
  @IsString()
  ability: string;

  @IsString()
  category: string;

  @IsString()
  source: string;
}

