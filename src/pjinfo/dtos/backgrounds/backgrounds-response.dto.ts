import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ResponseBackgroundPjInfoDto {
  @IsString()
  backgroundId: string;

  @IsString()
  backgroundUrl: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class ResponseBackgroundImagePjInfoDto {
  @ValidateNested({ each: true })
  @Type(() => ResponseBackgroundPjInfoDto)
  @IsArray()
  backgrounds: Array<ResponseBackgroundPjInfoDto>;
}
