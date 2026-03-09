import { Body, Controller, Get, Post, HttpStatus, Res, UseGuards, Headers } from '@nestjs/common';
import { LTILoginDto } from './dto/lti-login.dto';
import { LtiService } from './lti.service';
import { Response } from 'express';
import { LTIAuthGuard } from './auth/guards/lti.guard';
import { GetLTILaunchInfo } from './auth/decorators/get-lti-user.decorator';
import { LTILaunchInfo } from './auth/lti-launch-info.interface';
import { CanvasService } from '../canvas.service';
import { ApiTags } from '@nestjs/swagger';
import { CustomLogger } from '../../logger/custom-logger.service';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';

@ApiTags('lti')
@Controller('lti')
export class LtiController {
  constructor(
    private readonly ltiService: LtiService,
    private readonly canvasService: CanvasService,
    private readonly prismaService: PrismaService,
    private readonly loggerService: CustomLogger,
  ) {}

  @Post('login')
  async login(@Body() ltiLoginDto: LTILoginDto, @Res() res: Response) {
    const url = await this.ltiService.getLTIAuthRedirectUrl(ltiLoginDto);
    res.redirect(HttpStatus.TEMPORARY_REDIRECT, url);
  }

  @UseGuards(LTIAuthGuard)
  @Post('launch')
  async launch(
    @GetLTILaunchInfo() ltiLaunchInfo: LTILaunchInfo,
    @Res() res: Response,
    @Headers('referer') referer: string,
  ) {
    let state: string = null;
    if (referer) {
      const url = new URL(referer);
      state = url.searchParams.get('state');

      if (!state) {
        this.loggerService.info({ message: 'batata -- unable to get state value' });
        state = randomUUID();
        await this.prismaService.canvasEphemeralLogin.create({
          data: {
            state: state,
            canvasUserId: parseInt(ltiLaunchInfo.canvasCustomParameters.canvasUserId),
            isValid: true,
            canvasUserEmail: ltiLaunchInfo.email,
          },
        });
      } else {
        await this.prismaService.canvasEphemeralLogin.update({
          where: { state: state },
          data: {
            canvasUserId: parseInt(ltiLaunchInfo.canvasCustomParameters.canvasUserId),
            isValid: true,
            canvasUserEmail: ltiLaunchInfo.email,
          },
        });
      }
    }

    const url = await this.canvasService.getOauth2RedirectUrl(ltiLaunchInfo, state);

    res.status(HttpStatus.TEMPORARY_REDIRECT).redirect(url);
  }

  @Get('config.json')
  config() {
    return this.ltiService.getLTIConfiguration();
  }

  @Get('jwks.json')
  jwks() {
    return this.ltiService.getPublicJwk();
  }
}
