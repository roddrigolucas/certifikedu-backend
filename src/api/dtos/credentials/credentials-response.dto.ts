import { IsDate, IsString } from 'class-validator';

export class ResponseKeyInfoAPIDto {
  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  apiKey: string;
}
