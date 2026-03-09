import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomLogger } from '../../../logger/custom-logger.service';
import { ICanvasUserData } from '../interfaces/canvas-platform.interfaces';
import { CanvasJwtService } from '../canvas-jwt.service';
import { randomUUID } from 'crypto';

@Injectable()
export class CanvasPlatformStrategy extends PassportStrategy(Strategy, 'canvasJwt') {
  constructor(private readonly logger: CustomLogger, private readonly canvasJwtService: CanvasJwtService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: async (__: any, _: any, done: any) => {
        const secret = this.canvasJwtService.getJwtSecret();
        if (!secret) {
          done(new Error('No Jwt secret'));
        }
        done(null, secret);
      },
    });
  }

  async validate(payload: any) {
    const requestId = randomUUID();
    this.logger.info({
      message: 'Start Canvas Token Verification',
      context: CanvasPlatformStrategy.name,
      payload: payload,
    });

    const canvasUserInfo: ICanvasUserData = await this.canvasJwtService.getCanvasUserInformation(
      payload.userId,
      payload.courseId,
      payload.schoolId,
    );

    this.logger.info({
      message: 'Completed Token Verification',
      context: CanvasPlatformStrategy.name,
      payload: payload,
      userEmail: payload.email,
      userStatus: payload.status,
    });

    const session = {
      requestId: requestId,
      userInfo: canvasUserInfo,
    };

    return session;
  }
}
