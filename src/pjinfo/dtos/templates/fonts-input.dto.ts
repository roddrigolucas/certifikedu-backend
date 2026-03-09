import { Type } from "class-transformer";
import { IsNumber, IsOptional, Min } from "class-validator";

export class FontPaginationDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  page: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit: number;
}
