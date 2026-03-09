import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class CreateStudyFieldAPIDto {
  @IsString()
  name: string;

  @IsString()
  field: string;

  @IsArray()
  @ArrayMinSize(1)
  abilities: string[];

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

export class EditStudyFieldAPIDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  field?: string;
}

export class ActivityToFieldAPIDto {
  @IsArray()
  @ArrayMinSize(1)
  activities: string[];
}

export class InternshipsToFieldAPIDto {
  @IsArray()
  @ArrayMinSize(1)
  internships: string[];
}

export class SubjectsToFieldAPIDto {
  @IsArray()
  @ArrayMinSize(1)
  subjects: string[];
}

export class AbilitiesToFieldAPIDto {
  @IsArray()
  @ArrayMinSize(1)
  abilities: string[];
}
