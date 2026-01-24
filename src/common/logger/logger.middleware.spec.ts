import { LoggerMiddleware } from './logger.middleware';
import { Request, Response, NextFunction } from 'express';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new LoggerMiddleware();
    mockRequest = {
      method: 'GET',
      url: '/test',
      headers: {},
    };
    mockResponse = {
      statusCode: 200,
    };
    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next function', () => {
    middleware.use(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle request and pass to next middleware', () => {
    middleware.use(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should work with different HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    methods.forEach((method) => {
      mockRequest.method = method;
      const nextFn = jest.fn();
      middleware.use(mockRequest, mockResponse, nextFn);
      expect(nextFn).toHaveBeenCalled();
    });
  });

  it('should work with different URLs', () => {
    const urls = ['/api/test', '/users', '/blogs/123'];
    urls.forEach((url) => {
      mockRequest.url = url;
      const nextFn = jest.fn();
      middleware.use(mockRequest, mockResponse, nextFn);
      expect(nextFn).toHaveBeenCalled();
    });
  });
});
