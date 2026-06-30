import { LevelingService } from "./leveling.service";
import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { GetUser } from "src/auth/decorators";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/auth/guard";
import { RankingDto, PlayerDashboardDto, PlayerHistoryDto } from "./dtos/leveling.dtos";

@ApiTags("Gamification PF")
@Controller("leveling/pf")
@UseGuards(JwtGuard)
export class LevelingPfController {
  constructor(
    private readonly levelingService: LevelingService,
  ) { }

  @Get('dashboard')
  async getDashboard(@GetUser('id') userId: string): Promise<PlayerDashboardDto> {
    return this.levelingService.getPlayerDashboard(userId);
  }

  @Get('history')
  async getHistory(@GetUser('id') userId: string): Promise<Array<PlayerHistoryDto>> {
    return this.levelingService.getHistory(userId);
  }

  @Get('my-rank')
  async getMyRank(@GetUser('id') userId: string) {
    return this.levelingService.getUserRank(userId);
  }

  @Get("achievements")
  async getAchievements(@GetUser('id') userId: string) {
    return this.levelingService.getUserAchievements(userId);
  }

  @Get("missions")
  async getMissions(@GetUser('id') userId: string) {
    return this.levelingService.getUserMissions(userId);
  }

  @Get("mission/:id")
  async getMission(@GetUser('id') userId: string, @Param('id') id: string) {
    // REVIEW
    return this.levelingService.getUserMissionDetail(id, userId);
  }

  @Get('global-ranking')
  async getGlobalRanking(): Promise<Array<RankingDto>> {
    const limit = 50

    return this.levelingService.getGlobalRanking(limit);
  }


  @Get('temporal-ranking')
   @ApiQuery({ name: 'period', enum: ['weekly', 'monthly'], required: false, description: 'Período do ranking: semanal (weekly) ou mensal (monthly)' })
   @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Limite de usuários a retornar (padrão: 50)' })
   async getTemporalRanking(
     @Query('period', new DefaultValuePipe('monthly')) period: 'weekly' | 'monthly',
     @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
   ): Promise<Array<RankingDto>> {
     return this.levelingService.getTemporalRanking(period, limit);
   }
}