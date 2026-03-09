import { IsString, IsOptional, IsNumber, IsDate, IsEnum, ValidateNested, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PdiStatus } from '@prisma/client';

export class BookResponseDto {
  @IsString()
  bookId: string;

  @IsString()
  title: string;

  @IsString()
  authorName: string;

  @IsOptional()
  @IsString()
  isbn?: string;
}

export class PdiAbilitiesResponseDto {
  @IsString()
  abilityId: string;

  @IsString()
  ability: string;

  @IsString()
  category: string;

  @IsBoolean()
  isReview: boolean;
}

export class PdiNodeResponseDto {
  @IsString()
  nodeId: string;

  @IsString()
  objective: string;

  @IsString()
  description: string;

  @IsBoolean()
  markedAsFinished: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookResponseDto)
  books: BookResponseDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PdiAbilitiesResponseDto)
  abilities: PdiAbilitiesResponseDto[];
}

export class PdiResponseDto {
  @IsString()
  pdiId: string;

  @IsString()
  title: string;

  @IsNumber()
  progressPercentage: number;

  @IsEnum(PdiStatus)
  status: PdiStatus;

  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PdiNodeResponseDto)
  nodes: PdiNodeResponseDto[];
}

class PdiInfoResponseDto {
  @IsString()
  pdiId: string;

  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @IsString()
  title: string;

  @IsEnum(PdiStatus)
  status: PdiStatus;

  @IsNumber()
  progressPercentage: number;
}

export class PdiListResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PdiInfoResponseDto)
  pdis: Array<PdiInfoResponseDto>;
}
