import { Controller, NotFoundException, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { AuxService } from '../../aux/aux.service';
import { CredentialsService } from '../../credentials-api/credentials.service';

@ApiTags('ADMIN -- API Credentials')
@Controller('api/v1')
@UseGuards(JwtGuard, RolesGuard)
export class CredentialsAdminController {
  constructor(private readonly credentialsService: CredentialsService, private readonly auxService: AuxService) {}

  @Roles('admin')
  @Patch('enable/:id')
  async enableUserAPI(@Param('id') id: string): Promise<{ success: boolean }> {
    const userPj = await this.auxService.getPjInfo(id);

    if (!userPj) {
      throw new NotFoundException('user not found.');
    }

    await this.credentialsService.enableUserAPI(id);

    return { success: true };
  }

  @Roles('admin')
  @Patch('disable/:id')
  async disableUserAPI(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.credentialsService.disableUserAPI(id);
    await this.credentialsService.disableUserKeys(id);

    return { success: true };
  }
}
