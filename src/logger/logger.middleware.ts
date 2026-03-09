// logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLogger } from './custom-logger.service';
import { IncomingHttpHeaders } from 'http';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    this.logger.info({
      message: 'Request received',
      context: LoggerMiddleware.name,
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query,
      params: req.params,
      headers: this.getHeadersLog(req.headers),
    });

    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        message: 'Request completed',
        context: LoggerMiddleware.name,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        headers: res.getHeaders(),
      };
      if (res.statusCode >= 500) {
        this.logger.error(logData);
      } else if (res.statusCode >= 400) {
        this.logger.warn(logData);
      } else {
        this.logger.info(logData);
      }
    });

    next();
  }

  private getHeadersLog(headers: IncomingHttpHeaders): Record<string, string> {
    return Object.keys(headers).reduce((acc, key) => {
      if (key === 'authorization') {
        return { ...acc, [key]: 'Bearer <token>' };
      }
      return { ...acc, [key]: headers[key] };
    }, {});
  }
}
