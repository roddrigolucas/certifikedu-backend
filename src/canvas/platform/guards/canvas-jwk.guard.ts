import { AuthGuard } from '@nestjs/passport';

export class CanvasJwtGuard extends AuthGuard('canvasJwt') {
  constructor() {
    super();
  }
}
