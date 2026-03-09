import { IsOptional, IsString } from "class-validator";

export class ResponseAbilityAdminDto {
  @IsString()
  @IsOptional()
  abilityId?: string;

  @IsString()
  ability: string;

  @IsString()
  category: string;
}

