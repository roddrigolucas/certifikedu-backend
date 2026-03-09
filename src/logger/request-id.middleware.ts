import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(
    @Inject(AsyncLocalStorage) private readonly asyncLocalStorage: AsyncLocalStorage<{ requestId: string }>,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = randomUUID();
    this.asyncLocalStorage.run({ requestId }, () => {
      req.headers['x-request-id'] = requestId;
      res.setHeader('x-request-id', requestId);
      next();
    });
  }
}
