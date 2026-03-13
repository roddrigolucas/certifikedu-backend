import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/users/guards';
import { PJRolesGuard } from '../guards/roles-guards-pj.guard';
import { PJRoles } from '../decorators/roles-pj.decorator';
import { Roles } from 'src/users/decorators';

import { AuxService } from 'src/_aux/_aux.service';
import { GetUser } from 'src/auth/decorators';
import { InverseService } from 'src/inverse/inverse.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseInverseImagePjInfoDto } from '../dtos/inverse/inverse-input.dto';

@ApiTags('Institutional -- Inverse')
@Controller('pj/:pjId')
@UseGuards(JwtGuard)
export class InversePjInfoController {
  constructor(
    private readonly auxService: AuxService,
    private readonly inverseService: InverseService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @PJRoles('basico')
  @Roles('enabled')
  @UseInterceptors(FileInterceptor('file'))
  @Post('inverse')
  async createinverseImage(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
  ): Promise<{ success: boolean }> {
    const pj = await this.auxService.getPjInfo(userId);

    await this.inverseService.createInverseImage(pj, file);

    return { success: true };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @PJRoles('basico')
  @Roles('enabled')
  @Delete('inverse/:inverseId')
  async deleteinverseImage(
    @Param('inverseId') inverseId: string,
    @GetUser('id') userId: string,
  ): Promise<{ success: boolean }> {
    const inverse = await this.inverseService.getInverseInfoById(inverseId);

    if (!inverse) {
      throw new NotFoundException('Imagem nao encontrada');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (inverse.idPJ !== pj.idPJ) {
      throw new ForbiddenException('Usuario nao pode deletar esse template');
    }

    await this.inverseService.deleteInverseImage(userId, inverse);

    return { success: true };
  }

  @UseGuards(RolesGuard, PJRolesGuard)
  @PJRoles('basico')
  @Roles('enabled')
  @Get('inverse')
  async getInverseImage(@GetUser('id') userId: string): Promise<ResponseInverseImagePjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);
    const images = await this.inverseService.getInverseImagesRecords(pj.idPJ);

    return {
      backgrounds: images.map((image) => {
        return {
          backgroundId: image.inverseId,
          backgroundUrl: image.imageUrl,
        };
      }),
    };
  }
}
