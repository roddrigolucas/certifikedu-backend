import {
  Controller,
  Delete,
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
import { JwtGuard } from '../../auth/guard';
import { BackgroundsService } from '../../backgrounds/background.service';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { ResponseBackgroundImageAdminDto } from '../dtos/backgrounds/backgrounds-response.dto';

@ApiTags('ADMIN -- Backgrounds')
@Controller('admin/backgrounds')
@UseGuards(JwtGuard, RolesGuard)
export class BackgroundsAdminController {
  constructor(private readonly backgroundsService: BackgroundsService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Roles('admin')
  @Post()
  async adminCreateBackgroundImage(@UploadedFile() file: Express.Multer.File): Promise<{ success: boolean }> {
    await this.backgroundsService.createPulicBackgroundImage(file);

    return { success: true };
  }

  @Roles('admin')
  @Get()
  async adminGetBackgroundsImage(): Promise<ResponseBackgroundImageAdminDto> {
    const publicImages = await this.backgroundsService.getPublicBackgroundImagesRecords();

    return {
      backgrounds: publicImages.map((background) => {
        return {
          backgroundId: background.backgroundId,
          backgroundUrl: background.imageUrl,
          isPublic: background.isPublic,
        };
      }),
    };
  }

  @Roles('admin')
  @Delete(':backgroundId')
  async adminDeleteBackground(@Param('backgroundId') backgroundId: string): Promise<{ success: boolean }> {
    const background = await this.backgroundsService.getBackgroundInfoById(backgroundId);

    if (!background) {
      throw new NotFoundException('Background image not found.');
    }

    await this.backgroundsService.deletePublicBackgroundImage(background);

    return { success: true };
  }
}
