import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/users/guards';
import { PJRolesGuard } from '../guards/roles-guards-pj.guard';
import { PJRoles } from '../decorators/roles-pj.decorator';
import { Roles } from 'src/users/decorators';
import { MetabaseService } from 'src/metabase/metabase.service';
import { AuxService } from 'src/aux/aux.service';
import { GetUser } from 'src/auth/decorators';

@ApiTags('Institutional -- Dashboards')
@Controller('pj/:pjId')
@UseGuards(JwtGuard)
export class MetabasePjInfoController {
  constructor(
    private readonly auxService: AuxService,
    private readonly dashboardsService: MetabaseService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('metabase-reports')
  async getPJRepors(@GetUser('id') userId: string): Promise<{ url: string }> {
    const pjInfo = await this.auxService.getPjInfo(userId);
    const url = await this.dashboardsService.getPJReports(pjInfo.CNPJ);
    return { url };
  }
}
