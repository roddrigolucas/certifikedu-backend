import { Body, Controller, Get, Post, HttpStatus, Res, UseGuards, Req } from '@nestjs/common';
import { MoodleLtiService } from './moodle-lti.service';
import { Response, Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CustomLogger } from '../../logger/custom-logger.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MoodleLTIAuthGuard } from './auth/guards/moodle-lti.guard';
import { GetMoodleLtiLaunchInfo, GetMoodleLtiConfig } from './auth/decorators/get-moodle-lti-user.decorator';
import { JwtService } from '@nestjs/jwt';

@ApiTags('moodle-lti')
@Controller('moodle-lti')
export class MoodleLtiController {
  constructor(
    private readonly ltiService: MoodleLtiService,
    private readonly prismaService: PrismaService,
    private readonly loggerService: CustomLogger,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    try {
      const url = await this.ltiService.getLTIAuthRedirectUrl(body);
      res.redirect(HttpStatus.TEMPORARY_REDIRECT, url);
    } catch (e) {
      this.loggerService.error({ message: 'Error in Moodle LTI login', error: e });
      res.status(HttpStatus.BAD_REQUEST).send(e.message);
    }
  }

  @UseGuards(MoodleLTIAuthGuard)
  @Post('launch')
  async launch(
    @GetMoodleLtiLaunchInfo() ltiLaunchInfo: any,
    @GetMoodleLtiConfig() config: any,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const moodleUserId = ltiLaunchInfo.sub;
    const email = ltiLaunchInfo.email;
    
    if (!email) {
      return res.status(HttpStatus.BAD_REQUEST).send('LTI token missing email claim.');
    }

    let pf = await this.prismaService.pessoaFisica.findUnique({ where: { email } });

    // If user does not exist in CertifikEDU, create a raw one using Moodle ID temporarily as documentNumber
    // In production, we'd want to use AuthService.signUpRawUser for this.
    let userId = pf?.userId;
    
    if (!pf) {
      // Find user if they have an AuthCredentials table record
      const authCreds = await this.prismaService.authCredentials.findUnique({ where: { email }});
      if (authCreds) {
        userId = authCreds.userId;
      }
    }

    let moodleUser = await this.prismaService.moodleUser.findUnique({
      where: {
        moodleUserId_moodleLtiId: {
          moodleUserId: moodleUserId,
          moodleLtiId: config.id,
        },
      },
    });

    if (!moodleUser) {
      moodleUser = await this.prismaService.moodleUser.create({
        data: {
          moodleUserId,
          email: email,
          moodleLtiId: config.id,
          idPF: pf?.idPF,
        },
      });
    } else if (!moodleUser.idPF && pf?.idPF) {
      await this.prismaService.moodleUser.update({
        where: { id: moodleUser.id },
        data: { idPF: pf.idPF },
      });
    }

    if (!userId) {
       // We should redirect to an error page or create an ephemeral intent 
       return res.status(HttpStatus.UNAUTHORIZED).send('Usuário não encontrado na base de dados CertifikEDU. Por favor cadastre-se primeiro.');
    }

    const payload = { email: email, sub: userId };
    const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET || 'secretKey', expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey', expiresIn: '7d' });

    const frontUrl = process.env.VITE_APPLICATION_URL || 'https://app.certifikedu.com.br';
    
    // Instead of setting cookies directly here on cross-origin post, we pass token back to front-end to handle it
    res.status(HttpStatus.TEMPORARY_REDIRECT).redirect(`${frontUrl}/moodle/auth?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  }

  @Get('jwks.json')
  jwks() {
    return this.ltiService.getPublicJwks();
  }
}
