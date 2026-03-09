import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';

export class CreatePdiDto {
  @IsString()
  title: string;

  @IsString()
  dailyTime: string;

  @IsOptional()
  @IsString()
  previousEducation: string;

  @IsOptional()
  @IsString()
  skills: string;

  @IsOptional()
  @IsString()
  goals: string;
}

export class UpdatePdiNodeDto {
  @IsBoolean()
  markedAsFinished: boolean;
}

export class PdiBookDto {
  @IsOptional()
  @IsString()
  isbn?: string;

  @IsString()
  title: string;

  @IsString()
  authorName: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class DescriptionNodePdiCallbackDto {
  @IsString()
  stepObjective: string;

  @IsString()
  completeDescriptionOfWhatToDo: string;
}

export class AbilitiesNodePdiCallbackDto {
  @IsString()
  habilidade: string;
}

export class BooksNodePdiCallbackDto {
  @IsString()
  title: string;

  @IsString()
  authorName: string;

  @IsString()
  description: string;
}

export class NodePdiCallbackDto {
  @ValidateNested()
  @Type(() => DescriptionNodePdiCallbackDto)
  description: DescriptionNodePdiCallbackDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AbilitiesNodePdiCallbackDto)
  abilities: Array<AbilitiesNodePdiCallbackDto>;

  @ValidateNested()
  @Type(() => BooksNodePdiCallbackDto)
  books: BooksNodePdiCallbackDto;
}

export class PdiCallbackDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodePdiCallbackDto)
  steps: Array<NodePdiCallbackDto>;

  @IsString()
  secret: string;

  @IsString()
  pdiId: string;

  @IsBoolean()
  hasError: boolean;
}
