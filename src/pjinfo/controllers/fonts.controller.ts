import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { FontsService } from '../../../src/fonts/fonts.service';
import { RolesGuard } from 'src/users/guards';
import { PJRolesGuard } from '../guards/roles-guards-pj.guard';
import { Roles } from 'src/users/decorators';
import { PJRoles } from '../decorators/roles-pj.decorator';
import { FontsResponseDto } from '../dtos/templates/fonts-response.dto';
import { AuxService } from 'src/_aux/_aux.service';

@ApiTags('Institutional -- Fonts')
@Controller('pj/:pjId')
@UseGuards(JwtGuard)
export class FontsInstitutionalController {
  constructor(
    private readonly fontsService: FontsService,
    private readonly auxService: AuxService,
  ) {}

  @UseGuards(RolesGuard, PJRolesGuard)
  @Roles('enabled')
  @PJRoles('basico')
  @Get('fonts')
  async getFonts(@Param('category') category?: 'description' | 'name'): Promise<FontsResponseDto> {
    let fonts = await this.fontsService.getFontsInfo();

    if (category === 'description') {
      fonts = fonts.filter((f) => f.category === 'Regular');
    }

    if (category === 'name') {
      fonts = fonts.filter((f) => f.category === 'Bold');
    }

    return {
      fonts: fonts.map((font) => {
        return {
          fontId: font.fontId,
          family: font.family,
          category: font.category,
          fontUrl: `${this.auxService.certifikeduImages}/${font.ttfUrl}`,
        };
      }),
    };
  }
}
