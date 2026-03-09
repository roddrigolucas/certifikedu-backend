import { Body, Controller, Get, Post, Put, Query, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { CanvasService } from './canvas.service';
import { CreateOrUpdateCanvasConfigurationDto } from './dto/create-canvas-configuration.dto';
import { RolesGuard } from '../users/guards';
import { Roles } from '../users/decorators';
import { Response } from 'express';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User PJ -- canvas')
@Controller('canvas')
export class CanvasController {
  constructor(private readonly canvasService: CanvasService) {}

  @Get('oauth2/callback')
  async oauth2Callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    const redirectUrl = await this.canvasService.handleOauth2Callback(code, state);

    res.status(HttpStatus.TEMPORARY_REDIRECT).redirect(redirectUrl);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Get('configuration')
  async getCanvasConfigurations() {
    return await this.canvasService.getCanvasConfigurations();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Get('lti/configuration')
  async getLTIConfiguration(@GetUser('id') userId: string) {
    return await this.canvasService.getLTIConfiguration(userId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Post('lti/configuration')
  async createLTIConfiguration(@GetUser() user: User, @Body() dto: CreateOrUpdateCanvasConfigurationDto) {
    return await this.canvasService.createLTIConfiguration(user, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('enabled')
  @Put('lti/configuration')
  async updateLTIConfiguration(@GetUser('id') userId: string, @Body() dto: CreateOrUpdateCanvasConfigurationDto) {
    return await this.canvasService.updateLTIConfiguration(userId, dto);
  }
}
