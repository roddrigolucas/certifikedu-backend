import { Type } from 'class-transformer';
import { IsArray, IsDate, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ResponseAbilitiesAPIDto } from '../abilities/abilities-response.dto';

export class ResponseStudyFieldAPIDto {
  @IsString()
  fieldId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  field: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseAbilitiesAPIDto)
  abilities: ResponseAbilitiesAPIDto[];

  @IsString()
  name: string;

  @IsArray()
  @IsOptional()
  curriculums?: string[];

  @IsArray()
  @IsOptional()
  activities?: string[];

  @IsArray()
  @IsOptional()
  subjects?: string[];

  @IsArray()
  @IsOptional()
  internships?: string[];
}
