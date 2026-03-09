import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class StepDto {
  @IsNumber()
  index: number;

  @IsString()
  id: string;
}

class LearningPathsModules {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  courses?: Array<StepDto>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  subjects?: Array<StepDto>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  internships?: Array<StepDto>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  activities?: Array<StepDto>;
}

export class CreateOrUpdateLearningPathDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  totalHoursWorkload?: string;

  @IsOptional()
  @IsString()
  templateId?: string;
  
  @ValidateNested()
  @Type(() => LearningPathsModules)
  modules: LearningPathsModules;
}
