import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class StudentStepInfo {
  @IsDate()
  completeDate: Date;

  @IsString()
  name: string;

  @IsString()
  idPf: string;
}

class StepAttributesResponseDto {
  @IsString()
  id: string;

  @IsString()
  name: string;
  
  @IsString()
  description: string;

  @IsNumber()
  totalHoursWorkload: number;

  @IsNumber()
  completedQty: number;

  @ValidateNested()
  @Type(() => StudentStepInfo)
  completedBy: Array<StudentStepInfo>;

  @IsOptional()
  @IsString()
  templateId?: string;
}

class StudentPathInfo {
  @IsDate()
  enrollDate?: Date;

  @IsBoolean()
  completed: Boolean;

  @IsDate()
  completedAt?: Date;

  @IsString()
  name: string;

  @IsString()
  idPf: string;

  @IsArray()
  @IsString({ each: true })
  modulesCompleted: Array<string>;
}

export class LearningPathsModulesResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepAttributesResponseDto)
  events: Array<StepAttributesResponseDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepAttributesResponseDto)
  subjects: Array<StepAttributesResponseDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepAttributesResponseDto)
  internships: Array<StepAttributesResponseDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepAttributesResponseDto)
  activities: Array<StepAttributesResponseDto>;

  @IsNumber()
  moduleIndex: number;

  @IsString()
  moduleId:string;
}

export class LearningPathResponsePjInfoDto {
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
  totalHoursWorkload?: number;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsNumber()
  totalModules: number;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => LearningPathsModulesResponse)
  modules: Array<LearningPathsModulesResponse>;

  @IsNumber()
  totalStudents: number;
  
  @IsNumber()
  studentsCompleted: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  students: Array<StudentPathInfo>;
}

export class LearningPathsResponsePjInfoDto {
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => LearningPathResponsePjInfoDto)
  paths: Array<LearningPathResponsePjInfoDto>
}
