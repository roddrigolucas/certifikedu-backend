import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/users/guards';
import { PJRolesGuard } from '../guards/roles-guards-pj.guard';
import { PJRoles } from '../decorators/roles-pj.decorator';
import { Roles } from 'src/users/decorators';
import { AuxService } from 'src/common/common.service';
import { GetUser } from 'src/auth/decorators';
import { ReportsMetricsDto } from '../dtos/reports/reports-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('Institutional -- Reports')
@Controller('pj/:pjId/reports')
@UseGuards(JwtGuard)
export class ReportsController {
  constructor(
    private readonly auxService: AuxService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('metrics')
  async getMetrics(@GetUser('id') userId: string, @Param('pjId') pjId: string): Promise<ReportsMetricsDto> {
    const pjInfo = await this.auxService.getPjInfo(userId);
    
    // Schools related to this PJ
    const pjSchools = await this.prisma.schools.findMany({
      where: { ownerUserId: pjInfo.idPJ },
      select: { schoolId: true }
    });
    const schoolIds = pjSchools.map(s => s.schoolId);

    const whereCondition = {
      OR: [
        { emissorId: userId },
        ...(schoolIds.length > 0 ? [{ schoolId: { in: schoolIds } }] : [])
      ]
    };

    const certificadosCadastrados = await this.prisma.certificates.count({
      where: whereCondition
    });

    const certificadosEmitidos = await this.prisma.certificates.count({
      where: {
        ...whereCondition,
        successStatus: 'SUCCESS'
      }
    });

    const errosEmissao = await this.prisma.certificates.count({
      where: {
        ...whereCondition,
        successStatus: 'FAILED'
      }
    });

    // Número de Alunos (Distinct receptorDoc)
    // Prisma distinct requires findMany to get distinct values, or groupBy
    const alunosGroup = await this.prisma.certificates.groupBy({
      by: ['receptorDoc'],
      where: {
        ...whereCondition,
        successStatus: 'SUCCESS',
        receptorDoc: { not: '' }
      },
    });

    const numeroAlunos = alunosGroup.length;

    return {
      certificadosCadastrados,
      certificadosEmitidos,
      numeroAlunos,
      errosEmissao
    };
  }
}
