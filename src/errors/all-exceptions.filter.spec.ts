import { ArgumentsHost, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomLogger } from '../logger/custom-logger.service';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let customLogger: CustomLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: CustomLogger,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
    customLogger = module.get<CustomLogger>(CustomLogger);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should log and respond with 500 status for InternalServerErrorException', () => {
    const exception = new InternalServerErrorException('Internal server error');
    const mockArgumentsHost = createMockArgumentsHost();

    filter.catch(exception, mockArgumentsHost);

    expect(customLogger.error).toHaveBeenCalledWith({
      message: 'Internal server error',
      context: 'AllExceptionsFilter',
      error: exception,
      stack: exception.stack,
    });

    expect(mockArgumentsHost.switchToHttp().getResponse().status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockArgumentsHost.switchToHttp().getResponse().json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'InternalServerErrorException',
    });
  });

  it('should not log for BadRequestException', () => {
    const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    const mockArgumentsHost = createMockArgumentsHost();

    filter.catch(exception, mockArgumentsHost);

    expect(customLogger.error).not.toHaveBeenCalled();

    expect(mockArgumentsHost.switchToHttp().getResponse().status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockArgumentsHost.switchToHttp().getResponse().json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Bad request',
      error: 'HttpException',
    });
  });

  it('should handle unknown exceptions', () => {
    const exception = new Error('Unknown error');
    const mockArgumentsHost = createMockArgumentsHost();

    filter.catch(exception, mockArgumentsHost);

    expect(customLogger.error).toHaveBeenCalledWith({
      message: 'Internal server error',
      context: 'AllExceptionsFilter',
      error: exception,
      stack: exception.stack,
    });

    expect(mockArgumentsHost.switchToHttp().getResponse().status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockArgumentsHost.switchToHttp().getResponse().json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal server error',
    });
  });
});

function createMockArgumentsHost(): ArgumentsHost {
  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({}),
      getResponse: jest.fn().mockReturnValue({
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      }),
    }),
  } as unknown as ArgumentsHost;
}
