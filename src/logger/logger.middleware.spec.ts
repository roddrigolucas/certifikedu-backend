import { LoggerMiddleware } from './logger.middleware';
import { CustomLogger } from './custom-logger.service'; // Adjust the path as necessary
import { Request, Response, NextFunction } from 'express';
import { IncomingHttpHeaders } from 'http';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
  let loggerMock: CustomLogger;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as CustomLogger;
    middleware = new LoggerMiddleware(loggerMock);

    req = {
      method: 'GET',
      path: '/test',
      body: { test: 'body' },
      query: { test: 'query' },
      params: { test: 'params' },
      headers: { authorization: 'Bearer sensitive-token', 'x-request-id': 'test-request-id' } as IncomingHttpHeaders,
    } as unknown as Request;

    res = {
      statusCode: 200,
      getHeaders: jest.fn().mockReturnValue({ 'content-type': 'application/json' }),
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          callback();
        }
      }),
    } as unknown as Response;

    next = jest.fn();
  });

  it('should log request details when a request is received', () => {
    middleware.use(req, res, next);

    expect(loggerMock.info).toHaveBeenCalledWith({
      message: 'Request received',
      context: LoggerMiddleware.name,
      method: 'GET',
      path: '/test',
      body: { test: 'body' },
      query: { test: 'query' },
      params: { test: 'params' },
      headers: { authorization: 'Bearer <token>', 'x-request-id': 'test-request-id' },
    });
    expect(next).toHaveBeenCalled();
  });

  it('should log response details when the response finishes', () => {
    middleware.use(req, res, next);

    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));

    const duration = expect.any(String);
    const logData = {
      message: 'Request completed',
      context: LoggerMiddleware.name,
      method: 'GET',
      path: '/test',
      statusCode: 200,
      duration,
      headers: { 'content-type': 'application/json' },
    };

    expect(loggerMock.info).toHaveBeenCalledWith(logData);
  });

  it('should log error level for status code 500', () => {
    res.statusCode = 500;

    middleware.use(req, res, next);

    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));

    const duration = expect.any(String);
    const logData = {
      message: 'Request completed',
      context: LoggerMiddleware.name,
      method: 'GET',
      path: '/test',
      statusCode: 500,
      duration,
      headers: { 'content-type': 'application/json' },
    };

    expect(loggerMock.error).toHaveBeenCalledWith(logData);
  });

  it('should log warn level for status code 400', () => {
    res.statusCode = 400;

    middleware.use(req, res, next);

    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));

    const duration = expect.any(String);
    const logData = {
      message: 'Request completed',
      context: LoggerMiddleware.name,
      method: 'GET',
      path: '/test',
      statusCode: 400,
      duration,
      headers: { 'content-type': 'application/json' },
    };

    expect(loggerMock.warn).toHaveBeenCalledWith(logData);
  });

  it('should mask authorization header in request logs', () => {
    middleware.use(req, res, next);

    expect(loggerMock.info).toHaveBeenCalledWith({
      message: 'Request received',
      context: LoggerMiddleware.name,
      method: 'GET',
      path: '/test',
      body: { test: 'body' },
      query: { test: 'query' },
      params: { test: 'params' },
      headers: { authorization: 'Bearer <token>', 'x-request-id': 'test-request-id' },
    });
    expect(next).toHaveBeenCalled();
  });
});
