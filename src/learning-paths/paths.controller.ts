import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { Roles } from 'src/users/decorators';
import { RolesGuard } from 'src/users/guards';
import { CreateOrUpdateLearningPathDto } from './dtos/paths-input.dto';
import { LearningPathResponseDto } from './dtos/paths-response.dto';
import { LearningPathService } from './path.service';

@ApiTags('Learning Paths')
@Controller('paths')
export class LearningPathController {
  constructor(private readonly learningPathService: LearningPathService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Get()
  async getLearningPaths(): Promise<LearningPathResponseDto> {
    return null
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Get(':pathId')
  async getLearningPath(@Param('pathId') pathId: string): Promise<LearningPathResponseDto> {
    return null
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Post()
  async createLearningPath(@Body() dto: CreateOrUpdateLearningPathDto): Promise<LearningPathResponseDto> {
    return null
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Patch(':pathId')
  async updateLearningPath(@Param('pathId') pathId: CreateOrUpdateLearningPathDto): Promise<LearningPathResponseDto> {
    return null
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Delete(':pathId')
  async deleteLearningPath(@Param('pathId') pathId: string): Promise<LearningPathResponseDto> {
    return null
  }
}
