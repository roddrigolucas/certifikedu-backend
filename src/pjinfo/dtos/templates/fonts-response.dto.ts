import { Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator"

class FontBasicInfoDto {
  @IsString()
  fontId: string;

  @IsString()
  family: string;

  @IsString()
  category: string;

  @IsString()
  fontUrl: string;
}

export class FontsResponseDto {
  @ValidateNested({each: true})
  @Type(() => FontBasicInfoDto)
  @IsArray()
  fonts: Array<FontBasicInfoDto>
}

