import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { AuxService } from 'src/_aux/_aux.service';
import { InstitutionalEventsService } from 'src/institutional-events/inst-events.service';
import { PJRolesGuard } from '../guards/roles-guards-pj.guard';
import { RolesGuard } from 'src/users/guards';
import { Roles } from 'src/users/decorators';
import { PJRoles } from '../decorators/roles-pj.decorator';
import {
  ResponseInstEventPjInfoDto,
  ResponseInstEventsBasicPjInfoDto,
  ResponseInstEventsPjInfoDto,
} from '../dtos/academic-structure/institutional-event/inst-event-response.dto';
import { GetUser } from 'src/auth/decorators';
import { CreateOrUpdateInstEventPjInfoDto } from '../dtos/academic-structure/institutional-event/inst-event-input.dto';

@ApiTags('Institutional -- Institutional Events')
@Controller('pj/:pjId/institutional-events/')
@UseGuards(JwtGuard)
export class InstitutionalEventsPjInfoController {
  constructor(
    private readonly auxService: AuxService,
    private readonly institutionalEventService: InstitutionalEventsService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get(':instEventId')
  async getInstitutionalEvent(
    @GetUser('id') userId: string,
    @Param('instEventId') instEventId: string,
  ): Promise<ResponseInstEventPjInfoDto> {
    return null;
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get()
  async getInstitutionalEvents(@GetUser('id') userId: string): Promise<ResponseInstEventsBasicPjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);

    const events = await this.institutionalEventService.getPjEvents(pj.idPJ);

    return {
      institutionalEvents: events.map((e) => {
        return {
          name: e.name,
          institutionalEventId: e.id,
        };
      }),
    };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Post()
  async createInstitutionalEvents(
    @GetUser('id') userId: string,
    @Body() dto: CreateOrUpdateInstEventPjInfoDto,
  ): Promise<ResponseInstEventsPjInfoDto> {
    return null;
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Patch()
  async updateInstitutionalEvents(
    @GetUser('id') userId: string,
    @Body() dto: CreateOrUpdateInstEventPjInfoDto,
  ): Promise<ResponseInstEventsPjInfoDto> {
    return null;
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Delete(':instEventId')
  async deleteInstitutionalEvents(
    @GetUser('id') userId: string,
    @Param('instEventId') instEventId: string,
  ): Promise<{ success: true }> {
    return { success: true };
  }
}
