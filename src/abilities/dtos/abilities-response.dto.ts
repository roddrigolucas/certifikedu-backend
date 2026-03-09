import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ResponseAbilityDto {
  @IsString()
  @IsOptional()
  abilityId?: string;

  @IsString()
  ability: string;

  @IsString()
  category: string;
}

//TODO: CHANGE THIS MOTHERFUCKER
export class ResponseAbilitiesDto {
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ResponseAbilityDto)
  abilities: Array<ResponseAbilityDto>
}

export class MUDARResponseAbilitiesDto {
  @IsString()
  @IsOptional()
  habilidadeId?: string;

  @IsString()
  habilidade: string;

  @IsString()
  tema: string;

}
