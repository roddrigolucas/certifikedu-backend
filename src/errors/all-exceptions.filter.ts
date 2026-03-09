import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { CustomLogger } from '../logger/custom-logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(@Inject(CustomLogger) private readonly customLogger: CustomLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorResponse = {
      statusCode: status,
      message: exception instanceof HttpException ? exception.message : 'Internal server error',
      error: exception instanceof HttpException ? exception.name : 'Internal server error',
    };

    if (status === HttpStatus.BAD_REQUEST) {
      // Handle validation errors from class-validator
      const responseBody = (exception as HttpException).getResponse();
      console.log(responseBody);
      if (responseBody instanceof Object && 'message' in responseBody) {
        errorResponse = {
          ...errorResponse,
          message: (responseBody as any).message,
        };
      }
    } else if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const logData = {
        message: 'Internal server error',
        context: 'AllExceptionsFilter',
        error: exception instanceof Error ? exception : new Error('Unknown error'),
        stack: exception instanceof Error ? exception.stack : null,
      };

      this.customLogger.error(logData);

      return response.status(status).json({
        statusCode: status,
        message: exception instanceof HttpException ? exception.message : 'Internal server error',
        error: exception instanceof HttpException ? exception.name : 'Internal server error',
      });
    }

    response.status(status).json(errorResponse);
  }
}
