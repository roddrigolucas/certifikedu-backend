import { Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { BackgroundsService } from '../../../backgrounds/background.service';
import { AuxService } from '../../../aux/aux.service';
import { CanvasJwtGuard } from '../guards/canvas-jwk.guard';
import { CanvasGetUser } from '../decorators/get-user-canvas.decorator';
import { ResponseCanvasBackgroundsDto } from '../dtos/backgrounds/canvas-backgrounds-response.dto';

@ApiTags('Canvas Platform -- Backgrounds')
@UseGuards(CanvasJwtGuard)
@Controller('canvas-platform')
export class CanvasBackgroundsController {
  constructor(
    private readonly auxService: AuxService,
    private readonly backgroundsService: BackgroundsService,
  ) { }

  @UseInterceptors(FileInterceptor('file'))
  @Post('backgrounds')
  async createBackgroundImage(
    @UploadedFile() file: Express.Multer.File,
    @CanvasGetUser('userId') userId: string,
  ): Promise<{ success: boolean }> {
    const pj = await this.auxService.getPjInfo(userId);

    await this.backgroundsService.createPrivateBackgroundImage(pj, file);

    return { success: true };
  }

  @Delete('backgrounds/:backgroundId')
  async deleteBackgroundImage(
    @CanvasGetUser('userId') userId: string,
    @Param('backgroundId') backgroundId: string,
  ): Promise<{ success: boolean }> {
    const background = await this.backgroundsService.getBackgroundInfoById(backgroundId);

    if (!background) {
      throw new NotFoundException('Imagem nao encontrada');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (background.idPJ !== pj.idPJ) {
      throw new ForbiddenException('Usuario nao pode deletar esse template');
    }

    await this.backgroundsService.deletePublicBackgroundImage(background);

    return { success: true };
  }

  @Get('backgrounds')
  async GetBackgroundImage(@CanvasGetUser('userId') userId: string): Promise<ResponseCanvasBackgroundsDto> {
    const images = await this.backgroundsService.getPrivateBackgroundImagesRecords(userId);

    return {
      backgrounds: images.map((image) => {
        return {
          backgroundId: image.backgroundId,
          backgroundUrl: image.imageUrl,
          isPublic: image.isPublic,
        };
      }),
    };
  }
}
