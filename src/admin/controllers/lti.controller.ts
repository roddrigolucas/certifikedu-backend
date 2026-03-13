import { Controller, NotFoundException, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guard';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { AuxService } from '../../_aux/_aux.service';
import { UsersService } from '../../users/users.service';

@ApiTags('ADMIN -- LTI')
@Controller('admin/lti')
@UseGuards(JwtGuard)
@UseGuards(JwtGuard, RolesGuard)
export class LtiAdminController {
  constructor(private readonly usersService: UsersService, private readonly auxService: AuxService) {}

  @Roles('admin')
  @Patch('/enable/:userId')
  async enableUserLTI(@Param('userId') userId: string): Promise<{ success: boolean }> {
    const pj = await this.auxService.getPjInfo(userId);

    if (!pj) {
      throw new NotFoundException('User Not found');
    }

    await this.usersService.enableUserLTI(userId);

    return { success: true };
  }

  @Roles('admin')
  @Patch('/disable/:userId')
  async disableUserLTI(@Param('userId') userId: string): Promise<{ success: boolean }> {
    const pj = await this.auxService.getPjInfo(userId);

    if (!pj) {
      throw new NotFoundException('User Not found');
    }

    await this.usersService.disableUserLTI(userId);

    return { success: true };
  }
}
