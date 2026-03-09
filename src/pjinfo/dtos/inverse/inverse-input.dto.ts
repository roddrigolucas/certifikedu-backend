import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

export class ResponseInversePjInfoDto {
  @IsString()
  backgroundId: string;

  @IsString()
  backgroundUrl: string;
}

export class ResponseInverseImagePjInfoDto {
  @ValidateNested({ each: true })
  @Type(() => ResponseInversePjInfoDto)
  @IsArray()
  backgrounds: Array<ResponseInversePjInfoDto>;
}
