import { IsNumber, IsOptional, IsString } from "class-validator";

export class Is3OperationsLambdaDto {
  @IsString()
  operation: string;

  @IsString()
  bucket: string;
  
  @IsString()
  @IsOptional()
  key?: string;

  @IsOptional()
  content?: any;

  @IsString()
  @IsOptional()
  prefix?: string;

  @IsNumber()
  @IsOptional()
  number?: number;
}
