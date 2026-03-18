import {
  UnauthorizedException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PdiService } from './pdi.service';
import { GetUser } from 'src/auth/decorators';
import { PdiStatus } from '@prisma/client';
import { AuxService } from 'src/_aux/_aux.service';
import { JwtGuard } from 'src/auth/guard';
import { Roles } from '../users/decorators';
import { RolesGuard } from '../users/guards';
import { ApiTags } from '@nestjs/swagger';
import { SecretManagerService } from '../aws/secrets-manager/secrets-manager.service';
import { TPdiCreateInput, TPdiWithNodesOutput } from './types/pdi.types';
import { CreatePdiDto, PdiCallbackDto, UpdatePdiNodeDto } from './dtos/pdi-input.dto';
import { PdiListResponseDto, PdiResponseDto } from './dtos/pdi-response.dto';
import { Is3OperationsLambdaDto } from './dtos/s3operations-input.dto';
import { RequestsService } from 'src/requests/requests.service';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { PdiAiService } from './pdi-ai.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('PDI')
@Controller('pdi')
export class PdiController {
  constructor(
    private readonly pdiService: PdiService,
    private readonly pdiAiService: PdiAiService,
    private readonly prisma: PrismaService,
    private readonly auxService: AuxService,
    private readonly smsService: SecretManagerService,
    private readonly requestsService: RequestsService,
  ) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Get(':pdiId')
  async getPDI(@Param('pdiId') pdiId: string, @GetUser('id') userId: string): Promise<PdiResponseDto> {
    const pf = await this.auxService.getPfInfo(userId);

    if (!pf) {
      throw new NotFoundException();
    }

    const pdi = await this.pdiService.getPdi(pdiId);

    if (!pdi) {
      throw new NotFoundException('Pdi not found');
    }

    return this.getPdiResponse(pdi);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Get()
  async listPDI(@GetUser('id') userId: string): Promise<PdiListResponseDto> {
    const pf = await this.auxService.getPfInfo(userId);

    if (!pf) {
      throw new NotFoundException();
    }

    const pdis = await this.pdiService.listPdi(pf.idPF);

    return {
      pdis: pdis.map((pdi) => ({
        pdiId: pdi.pdiId,
        createdAt: pdi.createdAt,
        title: pdi.title,
        status: pdi.status,
        progressPercentage: this.calculateProgressPercentage(pdi.nodes),
      })),
    };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Post()
  async createPDI(@GetUser('id') userId: string, @Body() dto: CreatePdiDto): Promise<PdiResponseDto> {
    const pf = await this.auxService.getPfInfo(userId);

    if (!pf) {
      throw new NotFoundException();
    }

    const pdiId = randomUUID();

    // 1. Fetch user certificates
    const certificates = await this.prisma.certificates.findMany({
      where: { receptorId: userId },
      include: {
        habilidades: {
          include: { habilidade: true }
        }
      }
    });

    // 2. Call local AI generator (synchronous delay 5-10s expected)
    const generatedNodes = await this.pdiAiService.generatePdiNodes(
      dto.title,
      dto.goals,
      dto.skills,
      dto.previousEducation,
      dto.dailyTime,
      certificates
    );

    // 3. Save initial PDI object
    const data: TPdiCreateInput = {
      pdiId: pdiId,
      title: dto.title,
      dailyTime: dto.dailyTime,
      previousEducation: dto.previousEducation,
      skills: dto.skills,
      goals: dto.goals,
      status: PdiStatus.SUCCESS,
      pf: { connect: { idPF: pf.idPF } },
    };

    let pdi = await this.pdiService.createPdi(data);

    // 4. Save generated AI nodes
    if (generatedNodes && generatedNodes.length > 0) {
      await this.pdiService.createPdiNodes(pdiId, generatedNodes);
      
      // refetch the PDI with included nodes
      pdi = await this.pdiService.getPdi(pdiId);
    }

    return this.getPdiResponse(pdi);
  }


  @UseGuards(JwtGuard)
  @Post('s3Operations')
  async s3OperationsWorkerControl(@Body() dto: Is3OperationsLambdaDto) {
    const response = await this.requestsService.s3OperationsLambda(dto);

    return response.data;
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Delete(':pdiId')
  async deletePDI(@Param('pdiId') pdiId: string, @GetUser('id') userId: string): Promise<{ message: string }> {
    const pf = await this.auxService.getPfInfo(userId);

    if (!pf) {
      throw new NotFoundException('User Not found');
    }

    const pdi = await this.pdiService.getPdi(pdiId);

    if (!pdi) {
      throw new NotFoundException('Pdi not found');
    }

    await this.pdiService.deletePdi(pdiId);

    return { message: 'PDI deleted successfully' };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Patch('nodes/:nodeId')
  async updatePdiNode(
    @Param('nodeId') nodeId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdatePdiNodeDto,
  ): Promise<PdiResponseDto> {
    const pf = await this.auxService.getPfInfo(userId);

    if (!pf) {
      throw new NotFoundException('User not found');
    }

    const node = await this.pdiService.updatePdiNode(nodeId, dto.markedAsFinished);

    const pdi = await this.pdiService.getPdi(node.pdiId);

    return this.getPdiResponse(pdi);
  }

  @Post('ai/callback')
  async aiCallback(@Body() dto: PdiCallbackDto) {
    const secret = await this.smsService.getSecretFromKey('aiRequestSecret');

    if (dto.secret !== secret) {
      throw new UnauthorizedException('Secret not valid');
    }

    if (dto.hasError) {
      //TODO: Implement retry
      await this.pdiService.updatePdiStatusById(dto.pdiId, PdiStatus.FAILED);
      return;
    }

    await this.pdiService.createPdiNodes(dto.pdiId, dto.steps);
    await this.pdiService.updatePdiStatusById(dto.pdiId, PdiStatus.SUCCESS);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Get('ws/token')
  async createJwtToken(): Promise<{ token: string }> {
    const token = jwt.sign({}, this.auxService.pdiJwtSecret, { expiresIn: '1m' });

    return { token: token };
  }

  private getPdiResponse(data: TPdiWithNodesOutput): PdiResponseDto {
    return {
      pdiId: data.pdiId,
      title: data.title,
      progressPercentage: this.calculateProgressPercentage(data.nodes),
      status: data.status,
      createdAt: data.createdAt,
      nodes: data.nodes.map((node) => {
        return {
          nodeId: node.nodeId,
          objective: node.objective,
          description: node.description,
          markedAsFinished: node.markedAsFinished,
          books: node.books.map((b) => {
            const book = b.book;
            return {
              bookId: book.bookId,
              title: book.title,
              authorName: book.authorName,
            };
          }),
          abilities: [
            ...node.abilities.map((ab) => {
              const ability = ab.ability;
              return {
                abilityId: ability.habilidadeId,
                ability: ability.habilidade,
                category: ability.tema,
                isReview: false,
              };
            }),
            ...node.abilitiesOnReview.map((ab) => {
              const ability = ab.abilityOnReview;
              return {
                abilityId: ability.id,
                ability: ability.habilidade,
                category: ability.tema,
                isReview: true,
              };
            }),
          ],
        };
      }),
    };
  }

  private calculateProgressPercentage(nodes: Array<{ markedAsFinished: boolean }>): number {
    const totalNodes = nodes.length;
    const finishedNodes = nodes.filter((node) => node.markedAsFinished).length;
    return totalNodes > 0 ? (finishedNodes / totalNodes) * 100 : 0;
  }
}
