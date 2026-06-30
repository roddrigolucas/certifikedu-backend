import { BadRequestException, Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/auth/guard";
import { LevelingService } from "./leveling.service";
import { AuxService } from "src/common/common.service";
import { GetUser } from "src/auth/decorators";
import { CreateMissionDto, RankingDto, ReportMissionEventDto } from "./dtos/leveling.dtos";
import { S3Service } from "src/aws/s3/s3.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Roles } from "src/users/decorators";
import { RolesGuard } from "src/users/guards";
import { SchoolsService } from "src/schools/schools.service";
import { User } from "@prisma/client";

@ApiTags("Gamification PJ")
@Controller("leveling/pj")
@UseGuards(JwtGuard)
export class LevelingPjController {
  constructor(
    private readonly levelingService: LevelingService,
    private readonly auxService: AuxService,
    private readonly s3Service: S3Service,
    private readonly schoolsService: SchoolsService
  ) { }

  @Post('mission')
  @UseGuards(RolesGuard)
  @Roles('enabled')
  @UseInterceptors(FileInterceptor('file')) // Expects field name 'file'
  @ApiConsumes('multipart/form-data')
  async createMissionPJ(
    @GetUser() user: User & { idPF: string },
    @Body() dto: CreateMissionDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const idPJ = user.id;
    const userId = await this.auxService.getUserIdFromPfId(user.idPF);

    if (!file) {
      throw new BadRequestException('Badge image is required');
    }

    const schoolId = await this.getSchoolIdByUserId(idPJ);

    const fileType = file.originalname.split('.').pop();
    const fileName = `schools/${schoolId}/gamification/${Date.now()}.${fileType}`;

    await this.s3Service.uploadFile(this.auxService.nestBucket, fileName, file);
    const badgeUrl = `${this.auxService.cloudfrontBucket}/${fileName}`;

    await this.levelingService.createMission(dto, schoolId, badgeUrl, userId);

    return { success: true };
  }

  @Get('missions')
  @UseGuards(RolesGuard)
  @Roles('enabled')
  async getMissions(@GetUser('id') userId: string) {
    const schoolId = await this.getSchoolIdByUserId(userId);
    const missions = await this.levelingService.getMissionsBySchool(schoolId, 'MISSION');

    return missions.map(m => ({
      id: m.id,
      achievement: m.title,
      pontos: m.xpReward,
      data: m.createdAt,
      status: m.isActive ? 'active' : 'inactive',
      type: m.category
    }));
  }

  @Get('achievements')
  @UseGuards(RolesGuard)
  @Roles('enabled')
  async getAchievements(@GetUser('id') userId: string) {
    const schoolId = await this.getSchoolIdByUserId(userId);
    const missions = await this.levelingService.getAchievementsBySchool(schoolId);

    return missions.map(m => ({
      id: m.id,
      achievement: m.title,
      pontos: m.xpReward,
      data: m.createdAt,
      status: m.isActive ? 'active' : 'inactive',
      type: m.category
    }));
  }

  @Get('mission/:id')
  @UseGuards(RolesGuard)
  @Roles('enabled')
  async getMissionDetail(@GetUser('id') userId: string, @Param('id') id: string) {
    const schoolId = await this.getSchoolIdByUserId(userId);

    return this.levelingService.getMissionDetail(id, schoolId);
  }

  @Get('ranking')
  async getSchoolRanking(
    @GetUser('id') userId: string,
  ): Promise<Array<RankingDto>> {
    const schoolId = await this.getSchoolIdByUserId(userId);
    const limit = 50

    return this.levelingService.getRankingBySchool(schoolId, limit);
  }

  @Post('event')
  async reportEvent(
    @GetUser('id') userId: string,
    @Body() dto: ReportMissionEventDto
  ) {
    await this.levelingService.processEvent(
      userId,
      dto.type,
      {
        reference: dto.referenceId,
        description: dto.description
      }
    )

    return { success: true }
  }

  private async getSchoolIdByUserId(userId: string): Promise<string> {
    const schoolContext = await this.schoolsService.getSchoolContextForUser(userId);
    if (!schoolContext) {
      throw new BadRequestException('User is not associated with any School (neither Owner nor Employee)');
    }

    const { schoolId } = schoolContext;
    return schoolId;
  }
}