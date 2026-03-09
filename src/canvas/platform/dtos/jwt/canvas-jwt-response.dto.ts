import { IsString } from "class-validator";


export class ResponseCanvasJwtDto {
  @IsString()
  token: string;
}
