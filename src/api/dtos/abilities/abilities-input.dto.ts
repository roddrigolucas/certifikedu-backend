import { IsString } from "class-validator";

export class CreateNewAbilitieAPIDto {
  @IsString()
  ability: string;

  @IsString()
  category: string;
}

