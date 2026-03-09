import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateActivityAPIDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  hoursWorkload: number;

  @IsArray()
  @IsOptional()
  curriculums?: string[];

  @IsString()
  @IsOptional()
  studyField?: string;
}

export class EditActivityAPIDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  hoursWorkload?: number;
}
