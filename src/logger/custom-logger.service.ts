import { Inject, Injectable } from '@nestjs/common';
import { LoggerOptions, createLogger, format, transports } from 'winston';
import { AsyncLocalStorage } from 'async_hooks';
import { ConfigService } from '@nestjs/config';

export interface LogData {
  message: string;
  context?: string;
  error?: Error;
  [key: string]: any;
}

@Injectable()
export class CustomLogger {
  constructor(
    @Inject(AsyncLocalStorage) private readonly asyncLocalStorage: AsyncLocalStorage<{ requestId: string }>,
    private readonly configService: ConfigService,
  ) { }

  private get winstonCustomOptions(): LoggerOptions {
    const formatDefinition =
      this.configService.get('LOCAL_DEVELOPMENT') === 'true'
        ? format.combine(format.timestamp(), format.prettyPrint({ colorize: true }))
        : format.combine(format.timestamp(), format.json());
    return {
      level: 'debug',
      format: formatDefinition,
      transports: [new transports.Console({ handleExceptions: true })],
    };
  }

  private logger = createLogger(this.winstonCustomOptions);

  info(logData: LogData) {
    this.logger.info(this.addRequestIdToLog(logData));
  }

  error(data: LogData) {
    if (data.error) {
      data = { ...data, error: this.extractErrorInfo(data.error) };
    }
    this.logger.error(this.addRequestIdToLog(data));
  }
  warn(logData: LogData) {
    this.logger.warn(this.addRequestIdToLog(logData));
  }

  debug(logData: LogData) {
    this.logger.debug(this.addRequestIdToLog(logData));
  }

  verbose(logData: LogData) {
    this.logger.verbose(this.addRequestIdToLog(logData));
  }

  private addRequestIdToLog(log: object) {
    const store = this.asyncLocalStorage.getStore();
    if (store && store.requestId) {
      return {
        ...log,
        requestId: store.requestId,
      };
    }
    return log;
  }

  private extractErrorInfo(error: Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
}
