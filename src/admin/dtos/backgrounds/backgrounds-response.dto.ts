import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ResponseBackgroundAdminDto {
  @IsString()
  backgroundId: string;

  @IsString()
  backgroundUrl: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class ResponseBackgroundImageAdminDto {
  @ValidateNested({ each: true })
  @Type(() => ResponseBackgroundAdminDto)
  @IsArray()
  backgrounds: Array<ResponseBackgroundAdminDto>;
}
