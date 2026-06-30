import { IsNotEmpty, IsString } from "class-validator";

export class GetRecommnedationsDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}