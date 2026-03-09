import { IsString } from 'class-validator';

export class ResponseBlockchainDto {
  @IsString()
  documentId: string;
}
