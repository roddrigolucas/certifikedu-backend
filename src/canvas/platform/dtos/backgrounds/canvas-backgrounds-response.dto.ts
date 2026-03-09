import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

class ResponseCanvasBackgroundDto {
  @IsString()
  backgroundId: string;

  @IsString()
  backgroundUrl: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class ResponseCanvasBackgroundsDto {
  @ValidateNested({ each: true })
  @Type(() => ResponseCanvasBackgroundDto)
  @IsArray()
  backgrounds: Array<ResponseCanvasBackgroundDto>;
}
