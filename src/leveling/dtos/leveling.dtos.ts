import { $Enums, GamificationCategory, MissionTriggerType } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class MissionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  title: string;

  @IsEnum($Enums.MissionStatus)
  status: $Enums.MissionStatus;

  @IsNumber()
  progress: number;

  @IsEnum($Enums.GamificationCategory)
  category: $Enums.GamificationCategory;
}

export class PlayerDashboardDto {
  @IsNumber()
  xpAtual: number;

  @IsNumber()
  xpMeta: number;

  @IsNumber()
  level: number;

  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MissionDto)
  missions: Array<MissionDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RankingDto)
  globalRanking: Array<RankingDto>;
}

export class CreateMissionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  xpReward: number; // Maps to "minutes" in frontend

  @IsEnum(MissionTriggerType)
  type: MissionTriggerType;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  requiredCount?: number = 1;

  @IsEnum(GamificationCategory)
  category: GamificationCategory;

  @IsOptional()
  @IsString()
  referenceId?: string; // For Specific Courses

  @IsString()
  @IsOptional()
  isActive?: string; // 'active' | 'unlocked' -> mapped to boolean in controller
}

export class PlayerHistoryDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsString()
  @IsNotEmpty()
  profileId: string;

  @IsString()
  actionDescription: string;

  @IsNumber()
  xpEarned: number;
}

export class RankingDto {
  @IsNumber()
  rank: number;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  xp: number;

  @IsNumber()
  level: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  imgS3Url: string;
}

export class ReportMissionEventDto {
  @IsEnum(MissionTriggerType)
  type: MissionTriggerType;

  @IsOptional()
  @IsString()
  referenceId?: string; // Optional: ID of the specific item (e.g., MissionID if manual claim)

  @IsOptional()
  @IsString()
  description?: string; // e.g., "Shared on LinkedIn"
}