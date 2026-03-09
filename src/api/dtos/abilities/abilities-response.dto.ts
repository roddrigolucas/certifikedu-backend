import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class ResponseAbilitiesAPIDto {
  @IsString()
  @IsOptional()
  abilityId?: string;

  @IsString()
  ability: string;

  @IsString()
  category: string;
}

export class ResponseCategoryMetricAPIDto {
  @IsString()
  category: string;

  @IsNumber()
  qty: number;
}

//Not in use yet, use when contract change
export class ResponseCategoryMetricsAPIDto {
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ResponseCategoryMetricAPIDto)
  metrics: Array<ResponseCategoryMetricAPIDto>

}
