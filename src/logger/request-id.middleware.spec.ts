import { RequestIdMiddleware } from './request-id.middleware';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-request-id'),
}));

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;
  let asyncLocalStorage: AsyncLocalStorage<{ requestId: string }>;

  beforeEach(() => {
    asyncLocalStorage = new AsyncLocalStorage<{ requestId: string }>();
    middleware = new RequestIdMiddleware(asyncLocalStorage);
  });

  it('should generate a request ID and set it in the headers and response', () => {
    const req = {
      headers: {},
    } as Request;
    const res = {
      setHeader: jest.fn(),
    } as unknown as Response;
    const next: NextFunction = jest.fn();

    middleware.use(req, res, next);

    expect(uuidv4).toHaveBeenCalled();
    expect(req.headers['x-request-id']).toBe('test-request-id');
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'test-request-id');
    expect(next).toHaveBeenCalled();
  });

  it('should run the async local storage with the correct request ID', () => {
    const req = {
      headers: {},
    } as Request;
    const res = {
      setHeader: jest.fn(),
    } as unknown as Response;
    const next: NextFunction = jest.fn();

    const asyncRunSpy = jest.spyOn(asyncLocalStorage, 'run');

    middleware.use(req, res, next);

    expect(asyncRunSpy).toHaveBeenCalledWith({ requestId: 'test-request-id' }, expect.any(Function));
  });
});
