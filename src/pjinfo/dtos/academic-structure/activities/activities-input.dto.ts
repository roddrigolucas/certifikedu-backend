import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateActivityPjInfoDto {
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

export class EditActivityPjInfoDto {
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
