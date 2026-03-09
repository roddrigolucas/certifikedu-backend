import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class StudentStepInfo {
  @IsDate()
  completeDate: Date;

  @IsString()
  name: string;

  @IsString()
  idPf: string;

  @IsOptional()
  @IsString()
  certificateId?: string;
}

class StepAttributesResponseDto {
  @IsNumber()
  index: number;

  @IsString()
  name: string;
  
  @IsString()
  description: string;

  @IsNumber()
  totalHoursWorkload: number;

  @IsNumber()
  completedQtd: number;

  @ValidateNested()
  @Type(() => StudentStepInfo)
  completedBy: Array<StudentStepInfo>;

  @IsOptional()
  @IsString()
  templateId?: string;
}

class LearningPathStepsResponseDto {
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => StepAttributesResponseDto)
  step: Array<StepAttributesResponseDto>;
}

class StudentPathInfo {
  @IsDate()
  enrollDate?: Date;

  @IsDate()
  completeDate?: Date;

  @IsBoolean()
  completed: boolean;

  @IsString()
  name: string;

  @IsString()
  idPf: string;

  @IsArray()
  @IsString({ each: true })
  stepsCompleted: Array<string>;
}

class LearningPathModules {
  @IsArray()
  @IsString({ each: true })
  courses: LearningPathStepsResponseDto;

  @IsArray()
  @IsString({ each: true })
  subjects: LearningPathStepsResponseDto;

  @IsArray()
  @IsString({ each: true })
  internships: LearningPathStepsResponseDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activities: LearningPathStepsResponseDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  students: StudentPathInfo;
}

export class LearningPathResponseDto {
  @IsString()
  pathId: string;

  @IsString()
  name: string;

  @IsDate()
  createdAt: Date;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  totalHoursWorkload?: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsNumber()
  totalSteps: number;

  @IsNumber()
  totalStudents: number;

  @ValidateNested()
  @Type(() => LearningPathModules)
  modules: LearningPathModules;
}

export class LearningPathsResponseDto {
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => LearningPathResponseDto)
  paths: Array<LearningPathResponseDto>

}

// ____________PUBLIC DTOS_______________
class StepAttributesPublicResponseDto {
  @IsString()
  name: string;
  
  @IsString()
  description: string;

  @IsNumber()
  totalHoursWorkload: number;
}

class LearningPathPublicModules {
  @IsNumber()
  moduleIndex: number;

  @IsString()
  moduleId:string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepAttributesPublicResponseDto)
  events: Array<StepAttributesPublicResponseDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepAttributesPublicResponseDto)
  subjects: Array<StepAttributesPublicResponseDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepAttributesPublicResponseDto)
  internships: Array<StepAttributesPublicResponseDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepAttributesPublicResponseDto)
  activities: Array<StepAttributesPublicResponseDto>;
}

export class LearningPathPublicResponseDto {
  @IsString()
  name: string;

  @IsDate()
  createdAt: Date;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  totalHoursWorkload?: number;

  @IsNumber()
  totalModules: number;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => LearningPathPublicModules)
  modules: Array<LearningPathPublicModules>;
}
