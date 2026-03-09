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
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { AuxService } from '../../aux/aux.service';
import { GetUser } from '../../auth/decorators';
import { JwtGuard } from '../../auth/guard';
import { BackgroundsService } from '../../backgrounds/background.service';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { PJRoles } from '../decorators/roles-pj.decorator';
import { ResponseBackgroundImagePjInfoDto } from '../dtos/backgrounds/backgrounds-response.dto';
import { PJRolesGuard } from '../guards/roles-guards-pj.guard';

@ApiTags('Institutional -- Backgrounds')
@Controller('pj/:pjId')
@UseGuards(JwtGuard, RolesGuard)
export class BackgroundsInstitutionalController {
  constructor(private readonly backgroundsService: BackgroundsService, private readonly auxService: AuxService) {}

  @UseGuards(PJRolesGuard)
  @PJRoles('basico')
  @Roles('enabled')
  @UseInterceptors(FileInterceptor('file'))
  @Post('backgrounds')
  async createBackgroundImage(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
  ): Promise<{ success: boolean }> {
    const pj = await this.auxService.getPjInfo(userId);

    await this.backgroundsService.createPrivateBackgroundImage(pj, file);

    return { success: true };
  }

  @UseGuards(PJRolesGuard)
  @PJRoles('basico')
  @Roles('enabled')
  @Delete('backgrounds/:backgroundId')
  async deleteBackgroundImage(
    @Param('backgroundId') backgroundId: string,
    @GetUser('id') userId: string,
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

  @UseGuards(PJRolesGuard)
  @PJRoles('basico')
  @Roles('enabled')
  @Get('backgrounds')
  async getBackgroundImage(@GetUser('id') userId: string): Promise<ResponseBackgroundImagePjInfoDto> {
    const pj = await this.auxService.getPjInfo(userId);
    const images = await this.backgroundsService.getPrivateBackgroundImagesRecords(pj.idPJ);

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
