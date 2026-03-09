import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { Roles } from 'src/users/decorators';
import { RolesGuard } from 'src/users/guards';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor() {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Get()
  async getEvents() {}
}
